#include <iostream>
#include <fstream>
#include <string>
using namespace std;

struct Task
{
  int id;
  string description;
  Task *next;
};

class ToDoList
{
private:
  Task *head;
  int nextId;

public:
  ToDoList() : head(nullptr), nextId(1) {}

  ~ToDoList()
  {
    Task *current = head;
    while (current)
    {
      Task *temp = current;
      current = current->next;
      delete temp;
    }
  }

  void addTask(const string &desc)
  {
    Task *newTask = new Task{nextId++, desc, nullptr};
    if (!head)
    {
      head = newTask;
    }
    else
    {
      Task *current = head;
      while (current->next)
        current = current->next;
      current->next = newTask;
    }
    cout << "✅ تمت إضافة المهمة.\n";
  }

  void showTasks() const
  {
    if (!head)
    {
      cout << "📭 لا توجد مهام.\n";
      return;
    }
    Task *current = head;
    cout << "📋 قائمة المهام:\n";
    while (current)
    {
      cout << "[" << current->id << "] " << current->description << "\n";
      current = current->next;
    }
  }

  void deleteTask(int id)
  {
    if (!head)
    {
      cout << "🚫 لا توجد مهام للحذف.\n";
      return;
    }

    if (head->id == id)
    {
      Task *temp = head;
      head = head->next;
      delete temp;
      cout << "🗑️ تم حذف المهمة.\n";
      return;
    }

    Task *current = head;
    while (current->next && current->next->id != id)
      current = current->next;

    if (current->next)
    {
      Task *temp = current->next;
      current->next = temp->next;
      delete temp;
      cout << "🗑️ تم حذف المهمة.\n";
    }
    else
    {
      cout << "❌ لم يتم العثور على المهمة.\n";
    }
  }

  void saveToFile(const string &filename) const
  {
    ofstream file(filename);
    if (!file)
    {
      cout << "⚠️ خطأ في فتح الملف.\n";
      return;
    }

    Task *current = head;
    while (current)
    {
      file << current->id << "|" << current->description << "\n";
      current = current->next;
    }

    file.close();
    cout << "💾 تم حفظ المهام في الملف.\n";
  }

  void loadFromFile(const string &filename)
  {
    ifstream file(filename);
    if (!file)
    {
      cout << "⚠️ لا يمكن تحميل الملف.\n";
      return;
    }

    string line;
    while (getline(file, line))
    {
      size_t sep = line.find('|');
      if (sep != string::npos)
      {
        int id = stoi(line.substr(0, sep));
        string desc = line.substr(sep + 1);
        Task *newTask = new Task{id, desc, nullptr};
        if (!head)
        {
          head = newTask;
        }
        else
        {
          Task *current = head;
          while (current->next)
            current = current->next;
          current->next = newTask;
        }
        nextId = max(nextId, id + 1);
      }
    }

    file.close();
    cout << "📂 تم تحميل المهام من الملف.\n";
  }
};

void showMenu()
{
  cout << "\n📌 قائمة الخيارات:\n";
  cout << "1. إضافة مهمة\n";
  cout << "2. عرض المهام\n";
  cout << "3. حذف مهمة\n";
  cout << "4. حفظ المهام\n";
  cout << "5. تحميل المهام\n";
  cout << "0. خروج\n";
  cout << "اختر: ";
}

int main()
{
  ToDoList list;
  int choice;
  string desc;
  int id;
  string filename = "tasks.txt";

  do
  {
    showMenu();
    cin >> choice;
    cin.ignore();

    switch (choice)
    {
    case 1:
      cout << "📝 أدخل وصف المهمة: ";
      getline(cin, desc);
      list.addTask(desc);
      break;
    case 2:
      list.showTasks();
      break;
    case 3:
      cout << "🔢 أدخل رقم المهمة للحذف: ";
      cin >> id;
      list.deleteTask(id);
      break;
    case 4:
      list.saveToFile(filename);
      break;
    case 5:
      list.loadFromFile(filename);
      break;
    case 0:
      cout << "👋 إلى اللقاء!\n";
      break;
    default:
      cout << "❗ خيار غير صالح.\n";
    }
  } while (choice != 0);

  return 0;
}
