<?php
class Database {
    private $host = "localhost";
    private $db_name = "solar_management_system";
    private $username = "solar_admin";
    private $password = "Strong_P@ssw0rd_2024!";
    public $conn;
    
    // الحصول على اتصال قاعدة البيانات
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4", 
                $this->username, 
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                )
            );
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            // لا تعرض رسالة الخطأ للعميل لأسباب أمنية
            die("عذراً، حدث خطأ في الاتصال بالنظام. يرجى المحاولة لاحقاً.");
        }
        
        return $this->conn;
    }
}
?>