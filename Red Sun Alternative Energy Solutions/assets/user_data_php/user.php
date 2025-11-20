<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// التحقق من الطلب المسبق (preflight request)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';

// التحقق من أن الطلب من مصدر موثوق (يمكنك إضافة المزيد من التحقق)
$allowed_origins = array("https://yourdomain.com", "http://localhost");
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}

// الحماية من هجمات CSRF (إذا كان الطلب ليس GET)
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    if (empty($_SERVER['HTTP_X_CSRF_TOKEN']) || $_SERVER['HTTP_X_CSRF_TOKEN'] !== $_SESSION['csrf_token']) {
        http_response_code(403);
        echo json_encode(array("message" => "طلب غير مصرح به."));
        exit();
    }
}

// الحد من معدل الطلبات
function rateLimit() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $key = "rate_limit_" . $ip;
    $current_time = time();
    
    if (apcu_exists($key)) {
        $data = apcu_fetch($key);
        $count = $data['count'];
        $time = $data['time'];
        
        if ($current_time - $time < 60) { // 60 ثانية
            if ($count > 100) { // 100 طلب في الدقيقة
                http_response_code(429);
                echo json_encode(array("message" => "لقد تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً."));
                exit();
            }
            apcu_store($key, array('count' => $count + 1, 'time' => $time), 60);
        } else {
            apcu_store($key, array('count' => 1, 'time' => $current_time), 60);
        }
    } else {
        apcu_store($key, array('count' => 1, 'time' => $current_time), 60);
    }
}

rateLimit();

$database = new Database();
$db = $database->getConnection();

$requestMethod = $_SERVER["REQUEST_METHOD"];

// الحصول على البيانات المرسلة
$input = json_decode(file_get_contents("php://input"), true);

if ($requestMethod == 'GET') {
    // الحصول على جميع المستخدمين
    try {
        $query = "SELECT u.*, 
                 COUNT(ud.id) as total_documents,
                 SUM(ud.is_completed) as completed_documents
                 FROM users u
                 LEFT JOIN user_documents ud ON u.id = ud.user_id
                 GROUP BY u.id
                 ORDER BY u.id DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // الحصول على حالة كل وثيقة لكل مستخدم
        foreach ($users as &$user) {
            $docQuery = "SELECT d.id, d.name, ud.is_completed 
                        FROM documents d
                        LEFT JOIN user_documents ud ON d.id = ud.document_id AND ud.user_id = :user_id
                        ORDER BY d.id";
            
            $docStmt = $db->prepare($docQuery);
            $docStmt->bindParam(':user_id', $user['id'], PDO::PARAM_INT);
            $docStmt->execute();
            
            $user['documents'] = $docStmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        http_response_code(200);
        echo json_encode($users);
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(array("message" => "عذراً، حدث خطأ في استرجاع البيانات."));
    }
} elseif ($requestMethod == 'POST') {
    // إضافة مستخدم جديد
    if (!empty($input['username']) && !empty($input['password']) && !empty($input['national_id']) && !empty($input['full_name'])) {
        try {
            // التحقق من عدم وجود اسم مستخدم مكرر
            $checkQuery = "SELECT id FROM users WHERE username = :username OR national_id = :national_id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':username', $input['username']);
            $checkStmt->bindParam(':national_id', $input['national_id']);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(array("message" => "اسم المستخدم أو رقم الهوية موجود مسبقاً."));
                exit();
            }
            
            // تشفير كلمة المرور
            $hashed_password = password_hash($input['password'], PASSWORD_DEFAULT);
            
            // إدخال المستخدم الجديد
            $query = "INSERT INTO users 
                     (username, password_hash, national_id, full_name, address, coord_x, coord_y, system_size, system_price, phone_number) 
                     VALUES 
                     (:username, :password_hash, :national_id, :full_name, :address, :coord_x, :coord_y, :system_size, :system_price, :phone_number)";
            
            $stmt = $db->prepare($query);
            
            // ربط القيم مع التحقق من النوع
            $stmt->bindParam(':username', htmlspecialchars(strip_tags($input['username'])));
            $stmt->bindParam(':password_hash', $hashed_password);
            $stmt->bindParam(':national_id', htmlspecialchars(strip_tags($input['national_id'])));
            $stmt->bindParam(':full_name', htmlspecialchars(strip_tags($input['full_name'])));
            $stmt->bindParam(':address', htmlspecialchars(strip_tags($input['address'] ?? '')));
            $stmt->bindParam(':coord_x', $input['coord_x'] ?? null, PDO::PARAM_STR);
            $stmt->bindParam(':coord_y', $input['coord_y'] ?? null, PDO::PARAM_STR);
            $stmt->bindParam(':system_size', $input['system_size'] ?? null, PDO::PARAM_STR);
            $stmt->bindParam(':system_price', $input['system_price'] ?? null, PDO::PARAM_STR);
            $stmt->bindParam(':phone_number', htmlspecialchars(strip_tags($input['phone_number'] ?? '')));
            
            if ($stmt->execute()) {
                $user_id = $db->lastInsertId();
                
                // إضافة سجلات الوثائق للمستخدم الجديد
                $docQuery = "INSERT INTO user_documents (user_id, document_id) 
                            SELECT :user_id, id FROM documents";
                
                $docStmt = $db->prepare($docQuery);
                $docStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                $docStmt->execute();
                
                http_response_code(201);
                echo json_encode(array("message" => "تم إضافة المستخدم بنجاح."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "عذراً، لا يمكن إضافة المستخدم حالياً."));
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "عذراً، حدث خطأ في إضافة المستخدم."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "بيانات غير مكتملة. يرجى التأكد من إدخال جميع الحقول الإلزامية."));
    }
} elseif ($requestMethod == 'PUT') {
    // تحديث بيانات المستخدم
    if (!empty($input['id']) && !empty($input['username']) && !empty($input['national_id']) && !empty($input['full_name'])) {
        try {
            // التحقق من عدم تكرار اسم المستخدم أو رقم الهوية لمستخدم آخر
            $checkQuery = "SELECT id FROM users WHERE (username = :username OR national_id = :national_id) AND id != :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':username', $input['username']);
            $checkStmt->bindParam(':national_id', $input['national_id']);
            $checkStmt->bindParam(':id', $input['id'], PDO::PARAM_INT);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(array("message" => "اسم المستخدم أو رقم الهوية موجود مسبقاً لمستخدم آخر."));
                exit();
            }
            
            // بناء استعلام التحديث ديناميكياً بناءً على الحقول المرسلة
            $updateFields = array();
            $params = array(':id' => $input['id']);
            
            if (!empty($input['username'])) {
                $updateFields[] = "username = :username";
                $params[':username'] = htmlspecialchars(strip_tags($input['username']));
            }
            if (!empty($input['national_id'])) {
                $updateFields[] = "national_id = :national_id";
                $params[':national_id'] = htmlspecialchars(strip_tags($input['national_id']));
            }
            if (!empty($input['full_name'])) {
                $updateFields[] = "full_name = :full_name";
                $params[':full_name'] = htmlspecialchars(strip_tags($input['full_name']));
            }
            if (isset($input['address'])) {
                $updateFields[] = "address = :address";
                $params[':address'] = htmlspecialchars(strip_tags($input['address']));
            }
            if (isset($input['coord_x'])) {
                $updateFields[] = "coord_x = :coord_x";
                $params[':coord_x'] = $input['coord_x'];
            }
            if (isset($input['coord_y'])) {
                $updateFields[] = "coord_y = :coord_y";
                $params[':coord_y'] = $input['coord_y'];
            }
            if (isset($input['system_size'])) {
                $updateFields[] = "system_size = :system_size";
                $params[':system_size'] = $input['system_size'];
            }
            if (isset($input['system_price'])) {
                $updateFields[] = "system_price = :system_price";
                $params[':system_price'] = $input['system_price'];
            }
            if (isset($input['phone_number'])) {
                $updateFields[] = "phone_number = :phone_number";
                $params[':phone_number'] = htmlspecialchars(strip_tags($input['phone_number']));
            }
            
            if (count($updateFields) > 0) {
                $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :id";
                $stmt = $db->prepare($query);
                
                foreach ($params as $key => &$value) {
                    $stmt->bindParam($key, $value);
                }
                
                if ($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("message" => "تم تحديث بيانات المستخدم بنجاح."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "عذراً، لا يمكن تحديث بيانات المستخدم حالياً."));
                }
            } else {
                http_response_code(400);
                echo json_encode(array("message" => "لم يتم إرسال أي بيانات للتحديث."));
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "عذراً، حدث خطأ في تحديث بيانات المستخدم."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "بيانات غير مكتملة. يرجى التأكد من إدخال جميع الحقول الإلزامية."));
    }
} elseif ($requestMethod == 'DELETE') {
    // حذف مستخدم
    if (!empty($input['id'])) {
        try {
            $query = "DELETE FROM users WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $input['id'], PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "تم حذف المستخدم بنجاح."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "عذراً، لا يمكن حذف المستخدم حالياً."));
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "عذراً، حدث خطأ في حذف المستخدم."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "لم يتم تحديد المستخدم المراد حذفه."));
    }
} else {
    http_response_code(405);
    echo json_encode(array("message" => "طريقة الطلب غير مسموحة."));
}
?>