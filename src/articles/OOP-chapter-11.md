> 本章核心：**继承（inheritance）＋派生（derivation）**，是“重用已有类”的主要机制，也是后面**多态**的前提。

## 11.1 继承与派生的概念

### 1. 面向对象四大特性

* 抽象（abstraction）
* 封装（encapsulation）
* **继承（inheritance）**
* 多态（polymorphism）

### 2. 基本概念

* **父类 / 基类（base class）**
  已经存在的类，作为“模板”和“基础”。

* **子类 / 派生类（derived class）**
  在父类基础上“扩充”得到的新类。

* **继承的本质**
  子类 **自动拥有** 父类的

  * 所有数据成员
  * 所有成员函数
    （注意：**构造函数、析构函数不能继承**）

### 3. 单继承与多重继承

* **单继承（single inheritance）**
  一个子类只从 **一个** 父类派生。结构类似一棵树：每个结点最多只有一个直接父节点。

* **多重继承（multiple inheritance）**
  一个子类同时从 **多个** 父类派生。结构更像网状，一个子类结点下面连着多个父类。

---

## 11.2 子类的声明方式

### 1. 一般形式

```cpp
class 派生类名 : 继承方式 基类名 {
    // 子类新增的成员（数据＋函数）
};
```

* 继承方式可以是：

  * `public`
  * `private`
  * `protected`
* 若省略继承方式，则 **默认是 `private` 继承**（常考点）。

### 2. 示例：Student / Student1

```cpp
#include <iostream>
using namespace std;

class Student {          // 基类
public:
    void display() {
        cout << "num: "  << num
             << " name: " << name
             << " sex: "  << sex << endl;
    }
private:
    int  num;
    char name[10];
    char sex;
};

class Student1 : public Student { // 公有继承
public:
    void display1() {             // 新增成员函数
        cout << "age: "    << age  << endl;
        cout << "address: "<< addr << endl;
    }
private:
    int  age;
    char addr[30];                // 新增数据成员
};
```

* 子类 `Student1`：

  * 继承了 `Student` 中的全部成员（除构造/析构函数）
  * 又新增了 `age`、`addr` 和 `display1()`。

---

## 11.3 子类的构成

> 子类成员 = **继承来的成员** + **自己新增的成员**

从父类构造一个子类，大致有三步：

1. **无选择地接收** 父类的全部成员

   * 包括：公有、保护、私有成员
   * 不包括：构造函数、析构函数

2. **根据继承方式调整访问权限**

   * 即：父类的 public / protected 在子类中可能变成 public / protected / private / 不可访问。

3. 在子类中**定义自己的构造函数和析构函数**

   * 构造函数、析构函数不能继承，只能重写。

> 关键点：父类的成员函数 **只认识父类里的成员**，**不能访问子类新增的成员**。

---

## 11.4 子类成员的访问属性

### 11.4.0 基本规则总览

* 三种继承方式：

  * `public` 公有继承
  * `private` 私有继承
  * `protected` 保护继承
* 三种成员本身的访问控制：

  * `public` 公有成员
  * `protected` 保护成员
  * `private` 私有成员
* 组合后，在子类中会形成四种“结果属性”：

  1. 公有（在子类内可访问，在子类对象外也可访问）
  2. 保护（在子类内可访问，类外不能访问）
  3. 私有（只在本类内可访问）
  4. 不可访问（子类内外都不能访问）

---

### 11.4.1 公有继承

> 声明形式：
> `class 子类名 : public 父类名 { ... };`

* 父类成员在子类中的访问属性变化：

| 父类成员属性      | 子类中（公有继承）      | 子类对象外可否访问 |
| ----------- | -------------- | --------- |
| `public`    | 仍为 `public`    | 可访问       |
| `protected` | 仍为 `protected` | 不能        |
| `private`   | **不可访问**       | 不能        |

#### 错误示例

```cpp
#include <iostream>
#include <string>
using namespace std;

class Student {
public:
    void get_value() {
        cin >> num >> name >> sex;
    }
    void display() {
        cout << "num: "  << num
             << " name: " << name
             << " sex: "  << sex << endl;
    }
private:
    int    num;
    string name;
    char   sex;
};

class Student1 : public Student {
public:
    void get_value_1() {
        // 企图直接读入父类私有成员：错误
        cin >> num >> name >> sex >> age >> addr;   // ❌
    }

    void display_1() {
        cout << "num: " << num << endl;    // ❌ 访问父类 private
        cout << "age: " << age << endl;    // ✔ 子类自己的私有成员
    }
private:
    int    age;
    string addr;
};
```

* 问题本质：`num`, `name`, `sex` 是 **父类的 `private` 成员**，对 `Student1` 来说完全不可见。

#### 正确写法：通过父类公有接口访问

```cpp
class Student1 : public Student {
public:
    void get_value_1() {
        get_value();            // 调用父类公有函数读 num/name/sex
        cin >> age >> addr;     // 再读子类新增成员
    }

    void display_1() {
        display();              // 通过公有函数输出父类部分
        cout << "age: "     << age
             << " address: " << addr << endl;
    }
private:
    int    age;
    string addr;
};

int main() {
    Student1 s1;
    s1.get_value_1();
    s1.display_1();
    // s1.display(); // 也可以单独调用：公有继承保留了 public 属性
    return 0;
}
```

---

### 11.4.2 私有继承

> 声明形式：
> `class 子类名 : private 父类名 { ... };`

* 父类成员在子类中的访问属性变化：

| 父类成员属性      | 子类中（私有继承）    | 子类对象外可否访问 |
| ----------- | ------------ | --------- |
| `public`    | 变成 `private` | 不能        |
| `protected` | 变成 `private` | 不能        |
| `private`   | 仍不可访问        | 不能        |

也就是说：**在子类内部可以调用父类的 public/protected 成员，但通过子类对象已经完全看不到这些接口了**。

#### 示例

```cpp
#include <iostream>
#include <string>
using namespace std;

class Student {
public:
    void get_value() {
        cin >> num >> name >> sex;
    }
    void display() {
        cout << "num: "  << num
             << " name: " << name
             << " sex: "  << sex << endl;
    }
private:
    int    num;
    string name;
    char   sex;
};

class Student1 : private Student {   // 私有继承
public:
    void get_value_1() {
        get_value();                 // ✔ 在子类内部调用没问题
        cin >> age >> addr;
    }
    void display_1() {
        display();                   // ✔
        cout << "age: "     << age
             << " address: " << addr << endl;
    }
private:
    int    age;
    string addr;
};

int main() {
    Student1 s;
    // s.display();   // ❌ 在类外，这里已是 Student1 的 private 成员
    s.get_value_1();
    s.display_1();     // ✔
    return 0;
}
```

* 私有继承的典型用途：**把“用到的父类实现”封装到子类内部**，对子类的使用者隐藏父类接口；在工程实践中使用频率相对较低。

---

### 11.4.3 保护成员和保护继承

#### 1. `protected` 成员

* 对外（类外）：和 `private` 一样 —— **不能访问**。
* 对子类：和 `public` 一样 —— **可以访问**。

总结：`protected` 是“**对外封闭，对子类开放**”。

#### 2. 保护继承 `protected`

> 声明形式：
> `class 子类名 : protected 父类名 { ... };`

* 父类成员在子类中的访问属性变化：

| 父类成员属性      | 子类中（保护继承）      | 子类对象外可否访问 |
| ----------- | -------------- | --------- |
| `public`    | 变成 `protected` | 不能        |
| `protected` | 仍为 `protected` | 不能        |
| `private`   | 仍不可访问          | 不能        |

* 在类外，无论是哪种继承方式，**对象都不能访问 `protected` 成员**。

#### 3. 私有继承 vs 保护继承

* 对“直接子类”本身来说：

  * 私有继承、保护继承在这个层级上的效果是一样的：子类里可以访问父类的 public/protected，类外访问不到。
* 但如果再往下继续派生新的子类：

  * 若基类是通过 **私有继承** 得到的：再往下的子类中，原来那个父类的成员会变成**不可访问**；
  * 若基类是通过 **保护继承** 得到的：再往下的子类中，原父类的 public/protected 仍为 `protected`，还能继续访问。

> 结论：一旦你希望某个类将来还会有子类，**不要用私有继承把通道封死**；通常应使用 **公有继承**（绝大多数情况）或保护继承。

---

### 11.4.4 多级派生时的访问属性

看一个多级派生结构：

```cpp
class A {
public:
    int i;
protected:
    void f2();
    int j;
private:
    int k;
};

class B : public A {
public:
    void f3();
protected:
    void f4();
private:
    int m;
};

class C : protected B {
public:
    void f5();
private:
    int n;
};
```

可以用表格总结“在各个类中对这些成员的访问属性”：

| 成员   | 在 A 中     | 在 B 中（公有继承 A） | 在 C 中（保护继承 B） |
| ---- | --------- | ------------- | ------------- |
| `i`  | public    | public        | protected     |
| `f2` | protected | protected     | protected     |
| `j`  | protected | protected     | protected     |
| `k`  | private   | 不可访问          | 不可访问          |
| `f3` | —         | public        | protected     |
| `f4` | —         | protected     | protected     |
| `m`  | —         | private       | 不可访问          |
| `f5` | —         | —             | public        |
| `n`  | —         | —             | private       |

总结两点：

1. **没有任何方式能让子类访问父类的 `private` 数据**。
2. 多级派生时，访问属性的变化**逐级叠加**：

   * A→B 用公有继承：A 的 public/protected 在 B 中不变；
   * B→C 用保护继承：B 的 public 变为 protected，protected 保持，private 不可访问。

---

### 小结：在子类中成员的 4 种状态

站在子类内部看，一个成员可能处于四种状态：

1. 公有成员（可被任何对象访问）
2. 保护成员（只在本类与子类内部可访问）
3. 私有成员（只在本类内部可访问）
4. 不可访问成员（父类的 private，或者被继承方式“挡掉”的成员）

---

## 11.5 子类的构造函数和析构函数

> 构造函数负责“初始化”；析构函数负责“清理”。
> **构造/析构函数不会被继承**，但子类对象构造、析构时必须先后调用父类的构造、析构函数。

### 11.5.1 简单子类的构造函数（单继承、一级派生）

#### 1. 例子：Student / Student1

```cpp
#include <iostream>
#include <string>
using namespace std;

class Student {
public:
    Student(int n, const string& na)   // 父类构造函数
        : num(n), name(na) {}

protected:      // 改为 protected 方便子类访问
    int    num;
    string name;
};

class Student1 : public Student {
public:
    // 子类构造函数：使用初始化列表调用父类构造
    Student1(int n, const string& na,
             int a, const string& ad)
        : Student(n, na) {   // 调父类构造函数
        age  = a;
        addr = ad;
    }

    void show() {
        cout << num  << ": "
             << name << ": "
             << age  << ": "
             << addr << endl;
    }

private:
    int    age;
    string addr;
};
```

#### 2. 初始化列表的一般形式

> **子类构造函数首行的一般形式：**

```cpp
子类名(总参数表)
    : 父类构造函数名(参数表)
{
    // 子类新增成员的初始化（或放到初始化列表里）
}
```

* 父类的数据，必须通过 “**调用父类构造函数**” 完成初始化。
* 通常将“与父类有关”的初始化放在初始化列表里，语义更清晰。

#### 3. 完全用初始化列表

```cpp
Student1(int n, const string& nam,
         int a, const string& ad)
    : Student(n, nam), age(a), addr(ad)
{
}
```

#### 4. 构造与析构的顺序

* 构造：

  1. 先调用**父类构造函数**
  2. 再执行**子类构造函数**本身
* 析构（对象销毁时）：

  1. 先执行**子类析构函数**
  2. 再执行**父类析构函数**

> 口诀：**构造“自上而下”，析构“自下而上”**。

---

### 11.5.2 有子对象的子类构造函数（继承 + 组合）

这里父类本身又包含一个“对象成员”（子对象）。

#### 1. 示例结构

```cpp
class Student {
public:
    Student(const string& nam) : name(nam) {}
    void display() {
        cout << "name: " << name << endl;
    }
protected:
    string name;
};

class Student1 : public Student {
public:
    Student1(const string& na,
             const string& nam,
             const string& ad)
        : Student(na),      // 初始化父类部分
          monitor(nam)      // 初始化子对象
    {
        addr = ad;          // 初始化本类新增数据
    }

    void show() {
        display();          // Student::display()，输出当前对象 name
        cout << addr << endl;
    }

    void show_monitor() {
        cout << "monitor is: ";
        monitor.display();  // 调用成员对象的成员函数
    }

private:
    Student monitor;        // 成员对象（子对象）
    string  addr;
};
```

#### 2. 有子对象时构造函数的一般形式

```cpp
子类名(总参数表)
    : 父类构造函数(参数…),
      子对象1(参数…),
      子对象2(参数…),
      ...
{
    // 初始化子类新增的普通数据成员
}
```

#### 3. 执行顺序（三步）

1. **调用父类构造函数**，初始化父类部分；
2. **依次调用各子对象的构造函数**，初始化对象成员；
3. **执行子类构造函数体**，初始化子类新增的普通成员。

> 注意：**实际调用顺序与初始化列表中书写顺序无关**，是由“类中成员的声明顺序 + 继承关系”决定的。父类总是先于子对象，子对象再先于本类。

---

### 11.5.3 多层派生时的构造函数

#### 1. 多级派生例子

```cpp
class Student {
public:
    Student(int n, const string& nam)
        : num(n), name(nam) {}
    void display() {
        cout << "num: "  << num
             << " name: " << name << endl;
    }
protected:
    int    num;
    string name;
};

class Student1 : public Student {
public:
    Student1(int n, const string& nam, int a)
        : Student(n, nam), age(a) {}

    void show() {
        display();
        cout << "age: " << age << endl;
    }
protected:
    int age;
};

class Student2 : public Student1 {
public:
    Student2(int n, const string& na,
             int a, int s)
        : Student1(n, na, a), score(s) {}

    void show_all() {
        show();
        cout << "score: " << score << endl;
    }
private:
    int score;
};
```

构造顺序（创建 `Student2` 对象时）：

1. `Student` 构造函数（最顶层父类）
2. `Student1` 构造函数
3. `Student2` 构造函数

析构顺序正好相反。

> 注意：`Student2` 的初始化列表 **不要** 再直接调用 `Student` 的构造函数，只调用它的直接父类 `Student1` 即可。

---

### 11.5.4 子类构造函数的特殊形式

1. **若父类提供了默认构造函数**（无参）：

   * 子类构造函数可以不写父类构造函数调用；
   * 编译器会自动在子类构造函数执行前调用父类的默认构造函数。

2. **若父类和子对象类都定义了默认构造函数**：

   * 子类 **可以不显式定义构造函数**；
   * 编译器会合成一个“默认子类构造函数”，其中自动调用父类和子对象的默认构造函数。

3. **若父类或子对象类只提供了带参数的构造函数**：

   * 子类构造函数的初始化列表中 **必须显式调用** 它们的构造函数；
   * 否则无法通过编译。

4. 析构顺序（有子对象时）：

   * 先执行子类析构函数；
   * 再依次调用子对象析构函数；
   * 最后调用父类析构函数。

---

## 11.6 多重继承

### 11.6.1 声明多重继承

一般形式：

```cpp
class D : public A, private B, protected C {
    // D 新增成员
};
```

* D 继承 A, B, C：

  * 对 A 采用 `public` 继承；
  * 对 B 采用 `private` 继承；
  * 对 C 采用 `protected` 继承；
* 每个父类的成员在 D 中的访问属性遵守前面讲过的“继承方式变换规则”。

---

### 11.6.2 多重继承子类的构造函数

构造函数的一般形式：

```cpp
D(总参数)
    : A(参数…), B(参数…), C(参数…)
{
    // D 自己的初始化
}
```

* 调用顺序：

  * 先调用 **所有父类构造函数**；
  * 再执行 D 自身构造函数体；
* 关键点：**父类构造函数的调用顺序由“子类继承列表中父类出现顺序”决定**，**与初始化列表中的书写顺序无关**。

#### 例：Teacher & Student → Graduate

```cpp
#include <iostream>
#include <string>
using namespace std;

class Teacher {
public:
    Teacher(const string& nam, const string& t)
        : name(nam), title(t) {}

    void display() {
        cout << name << ": " << title << endl;
    }
protected:
    string name;   // 姓名
    string title;  // 职称
};

class Student {
public:
    Student(const string& nam, float sco)
        : name1(nam), score(sco) {}

    void display1() {
        cout << name1 << ": " << score << endl;
    }
protected:
    string name1;  // 姓名
    float  score;  // 成绩
};

class Graduate : public Teacher, public Student {
public:
    Graduate(const string& n,
             const string& t,
             float s,
             float w)
        : Teacher(n, t),      // 初始化 Teacher 部分
          Student(n, s),      // 初始化 Student 部分
          wage(w) {}          // 初始化本类成员

    void show() {
        cout << name << ": " << title << endl;  // 来自 Teacher
        cout << score << ": " << wage  << endl; // 来自 Student
    }
private:
    float wage; // 工资
};

int main() {
    Graduate grad1("Wang", "assistant", 89.5f, 1234.5f);
    grad1.show();
    return 0;
}
```

* 此处故意在两个父类中都存储姓名（`name` 与 `name1`），但语义上是同一人的姓名；
* 在 `Graduate` 的构造函数中，同一个参数 `n` 被分别传递给两个父类的构造函数。

---

### 11.6.3 多重继承引起的二义性问题

多重继承的常见坑：**同名成员引起歧义**。常见三种情况。

#### 情况一：两个父类有同名成员

```cpp
class A {
public:
    int a;
    void display();
};

class B {
public:
    int a;
    void display();
};

class C : public A, public B {
public:
    int b;
    void show();
};

int main() {
    C c1;
    c1.a = 3;        // ❌ 二义性：A::a 还是 B::a ?
    c1.display();    // ❌ 二义性：A::display 还是 B::display ?
}
```

解决方法：**使用作用域运算符说明来自哪个父类**：

```cpp
c1.A::a = 3;          // 指定访问 A 部分的 a
c1.B::display();      // 指定调用 B 部分的 display()

// 在 C 的成员函数内部，可以省略对象名：
void C::show() {
    A::a = 3;         // 当前对象的 A 子对象里的 a
    B::display();
}
```

---

#### 情况二：两个父类和子类三者都有同名成员

```cpp
class C : public A, public B {
public:
    int a;
    void display();
};

int main() {
    C c1;
    c1.a = 3;        // ✔ 访问 C::a
    c1.display();    // ✔ 调用 C::display()
}
```

* 规则：**子类中新增加的同名成员会遮蔽（覆盖）父类中的同名成员**。
  只要名字相同，且参数列表也一致，就构成“同名覆盖”。

与“函数重载”的区别：

* 覆盖（隐藏）：

  * 发生在**继承关系**中；
  * 函数名相同，参数列表也相同；
  * 子类版本把父类版本**遮住**。
* 重载（overload）：

  * 发生在同一个类中；
  * 函数名相同，但参数个数或类型不同；
  * 通过参数匹配选择不同版本。

若要在子类外访问父类的同名成员，仍可以：

```cpp
c1.A::a = 3;
c1.B::display();
```

---

#### 情况三：菱形结构（A 与 B 都继承自同一父类 N，C 再多重继承 A 与 B）

```cpp
class N {
public:
    int a;
    void display() {
        cout << "N::a = " << a << endl;
    }
};

class A : public N {
public:
    int a1;
};

class B : public N {
public:
    int a2;
};

class C : public A, public B {
public:
    int a3;
    void show() {
        cout << "a3 = " << a3 << endl;
    }
};
```

此时 `C` 通过两条路径继承了 N：`C → A → N` 和 `C → B → N`，因此 `C` 内部实际上有两份 `N` 子对象。

```cpp
int main() {
    C c1;
    // c1.a = 3;        // ❌ 二义性：A::N 部分的 a 还是 B::N 部分的 a？
    // c1.display();    // ❌ 二义性
}
```

必须通过“直接子类名＋作用域”来指明哪一条路径：

```cpp
c1.A::a = 3;      // 访问 A 继承自 N 的那份 a
c1.B::display();  // 调用 B 继承自 N 的那份 display()
```

> 这类“菱形继承”会导致数据重复、歧义多，所以才有“虚基类”这一机制。

---

### 11.6.4 虚基类（virtual base class）

#### 1. 虚基类的目的

> 让“间接共同父类”在最终子类中**只保留一份成员**，消除菱形继承带来的数据重复与二义性。

声明虚基类是通过在“派生列表”中加上 `virtual` 关键字：

```cpp
class A { ... };                        // 普通父类

class B : virtual public A { ... };     // A 是 B 的虚基类
class C : virtual public A { ... };     // A 是 C 的虚基类

class D : public B, public C { ... };   // D 通过 B 和 C 间接继承 A
```

* 若在 B、C 中都把 A 声明为虚基类，则 D 中只保留 **一份** A 子对象；
* 否则仍会有两份 A 子对象。

> 实际应用：多用于“共用基础信息”的情况，例如 Person 作为 Teacher 与 Student 的共同基类。

#### 2. 虚基类的初始化

若虚基类 A 没有默认构造函数，则：

* **所有派生类（包括直接和间接）** 的构造函数初始化列表中，都要为虚基类 A 写一个构造函数调用；
* **真正起作用的是“最底层（most derived）子类”的那一次初始化**，这是 C++ 语言规则。

示例结构：

```cpp
class A {
public:
    A(int i) { /* ... */ }
};

class B : virtual public A {
public:
    B(int n) : A(n) { /* ... */ }
};

class C : virtual public A {
public:
    C(int n) : A(n) { /* ... */ }
};

class D : public B, public C {
public:
    D(int n)
        : A(n),       // 对虚基类 A 的初始化（真正生效）
          B(n), C(n)  // 直接父类初始化
    { /* ... */ }
};
```

* 构造顺序仍然是：**先虚基类 A，再其它非虚父类，再本类**。

#### 3. 虚基类的应用：Person / Teacher / Student / Graduate

```cpp
class Person {
public:
    Person(const string& n) : name(n) {}
protected:
    string name;
};

class Teacher : virtual public Person {
public:
    Teacher(const string& n, const string& t)
        : Person(n), title(t) {}
protected:
    string title;
};

class Student : virtual public Person {
public:
    Student(const string& n, float s)
        : Person(n), score(s) {}
protected:
    float score;
};

class Graduate : public Teacher, public Student {
public:
    Graduate(const string& n,
             const string& t,
             float s,
             float w)
        : Person(n),           // 虚基类初始化
          Teacher(n, t),
          Student(n, s),
          wage(w) {}

    void show() {
        cout << name  << ": "
             << title << ": "
             << score << ": "
             << wage  << endl;
    }
private:
    float wage;
};
```

* Person 作为 Teacher 与 Student 的虚基类；
* Graduate 中只保留一份 `Person` 成员 `name`；
* 在 `show()` 中直接访问 `name` 即可，不再有“哪条路径”的问题。

---

## 11.7 父类与子类的转换

> 仅对 **公有继承** 的子类，才可以看作父类的“真正子类型”，转换才有意义且安全。

### 1. 子类对象赋值给父类对象（对象切片）

```cpp
class A { /* ... */ };
class B : public A { /* 新增成员 */ };

A a1;
B b1;

a1 = b1;   // ✔ 允许：B → A
```

* 结果：只拷贝 `b1` 中 **A 部分的数据** 到 `a1`；
* 子类 B 增加的那部分成员数据会被**截断（object slicing）**。

**反过来不允许**：

```cpp
// b1 = a1; // ❌ 不能用父类对象给子类对象赋值
```

* 不同子类之间也不能互相赋值（除非定义了转换函数，这里不考虑）。

### 2. 子类对象初始化父类对象的“引用”

```cpp
B b1;
A& r = b1;     // 使用子类对象初始化父类引用
```

* `r` 是“**b1 中父类 A 那一部分的别名**”；
* 它不是整个 `b1` 的别名，只能通过 `r` 访问 A 中定义的成员。

### 3. 形参为父类时，可以用子类对象作为实参

```cpp
void fun(A& r) {
    cout << r.num << endl;
}

B b1;
fun(b1);       // ✔ 自动上溯转换 B → A
```

* 在 `fun` 内，只能访问 A 的成员；
* 即使传入的是子类对象，也不能访问子类新增成员。

### 4. 指向父类对象的指针可以指向子类对象

```cpp
class Student {
public:
    Student(const string& n, float s)
        : name(n), score(s) {}
    void display() {
        cout << "name: "  << name  << endl
             << "score: " << score << endl;
    }
private:
    string name;
    float  score;
};

class Graduate : public Student {
public:
    Graduate(const string& n,
             float s,
             float p)
        : Student(n, s), pay(p) {}

    void display() {          // 子类增加一个同名函数
        Student::display();
        cout << "pay = " << pay << endl;
    }
private:
    float pay;
};

int main() {
    Student  stud1("Li",   87.5f);
    Graduate grad1("Wang", 98.5f, 563.5f);

    Student* pt = &stud1;
    pt->display();            // 调用 Student::display

    pt = &grad1;              // 指向子类对象
    pt->display();            // 仍调用 Student::display（不是 Graduate::display）
    return 0;
}
```

* `pt` 实际指向的是 `grad1` 中“从 Student 继承来的那部分”；
* 通过 `Student*` 只能访问 `Student` 中的成员，不知道也访问不到 `pay`；
* 因为 `display()` 没有声明为 `virtual`，所以调用的是“指针静态类型”的版本。

> 这为后续“虚函数和多态”做铺垫：要想让 `pt` 调用 `Graduate::display()`，需要将 `display` 声明为虚函数。

---

## 11.8 继承与组合（Composition）

> 一个类中可以包含 **另一个类的对象** 作为数据成员，称为**类的组合**。

### 1. 示例：Professor 类

设有：

```cpp
class Teacher {
public:
    // ...
private:
    int    num;
    string name;
    char   sex;
};

class BirthDate {
public:
    // ...
private:
    int year;
    int month;
    int day;
};
```

通过**继承 + 组合**构造一个 Professor 类：

```cpp
class Professor : public Teacher {
public:
    // ...
private:
    BirthDate birthday;   // 组合：把 BirthDate 的对象作为成员
};
```

* `Professor` 通过 **继承 Teacher** 获得 `num`, `name`, `sex` 等成员；
* 通过 **组合 BirthDate** 获得 `year`, `month`, `day` 等生日信息。

> 继承是“**is-a**”：Professor **是一个** Teacher。
> 组合是“**has-a**”：Professor **有一个** BirthDate。

### 2. 继承 vs 组合 的类型兼容性

设有函数：

```cpp
void fun1(Teacher&);    // 形参是 Teacher 引用
void fun2(BirthDate&);  // 形参是 BirthDate 引用
```

在 `main` 中：

```cpp
Professor prof1;

// OK：Professor 是 Teacher 的公有子类
fun1(prof1);            // ✔ 赋值兼容（上溯转换）

// OK：prof1.birthday 是 BirthDate 类型对象
fun2(prof1.birthday);   // ✔ 类型匹配

// 错误：Professor 不是 BirthDate 的子类
// fun2(prof1);         // ❌ 类型不兼容
```

* **继承带来“类型兼容关系”**（子类可以当作父类用）；
* 组合不带来这种兼容性，组合类与成员类之间只有“包含”关系。

### 3. 组合的优点

* 修改成员类的内部实现（如 `BirthDate` 的实现）时，只要其**公有接口不变**，组合类 `Professor` 一般不需要修改代码，仅需重新编译；
* 组合是另一种重要的**代码重用**方式，与继承“纵向扩展”不同，它是“横向拼装”。

---

## 11.9 继承在软件开发中的重要意义

### 1. 继承带来的软件重用

* C++ 相对于 C 的关键差异之一，就是提供了继承机制；
* 有了继承，可以基于已有的类定义新类，复用：

  * 数据结构设计
  * 接口协议
  * 已验证正确的实现代码

类库的发展：

* 许多厂商开发了大量通用类库（图形界面、容器、算法等），供用户作为父类使用；
* 用户通过继承扩展这些父类，定制出适合自己业务需求的子类。

> 在工程实践中，很多父类本身就是“**专门为做父类而设计的**”，例如抽象类、接口类。

### 2. 类库与编译链接

* 类库中：

  * 类的声明（接口）一般放在**头文件**中；
  * 函数实现部分单独编译，形成目标代码放在库文件里；
* 用户编程时只需：

  * 包含对应头文件；
  * 在链接阶段连接上这些库目标文件；
  * 无需知道具体源代码实现。

继承的好处：

* 父类已经是单独编译好的；
* 子类编译时只针对新增加部分；
* 若修改了父类，只要公有接口不变，通常只需重新编译父类及其子类。

### 3. 为什么“尽量用继承建立新类”，而不是直接修改旧类？

原因包括：

1. **旧类可能被很多其他模块或程序依赖**，直接修改会破坏其他程序的正确性。
2. 用户通常拿到的是**库和头文件**，而不是父类的源代码，直接修改也做不到。
3. 父类在类库中可能已经与多种组件建立了复杂关系，是库设计者刻意保持“稳定”的基础部分，不宜随意修改。
4. 很多父类本来就是“抽象设计的结果”，用于构建类层次结构；修改它反而破坏了设计。
5. 面向对象方法强调：从抽象基类开始，自上而下逐步细化，**通过继承层次来逼近问题的具体实现**。

> 总结：**继承是组织大型软件系统、管理复杂性的主要手段之一**，同时与组合一起构成 C++ 代码复用的核心工具。

## 本章知识结构小结

1. **继承与派生概念**：父类 / 子类、单继承 / 多重继承。
2. **子类声明与构成**：

   * `class 派生类 : 继承方式 基类 { ... }`
   * 子类 = 继承成员 + 新增成员；构造 / 析构不会继承。
3. **三种继承方式与访问控制**：

   * 公有继承：`public`→`public`，`protected`→`protected`，`private` 不可访问；
   * 私有继承：`public`/`protected`→`private`；
   * 保护继承：`public`/`protected`→`protected`。
4. **多级派生中的访问属性演变**，牢记“父类 private 永远不可访问”。
5. **子类构造 / 析构的调用顺序**：

   * 有继承：父类 → 子类；
   * 有子对象：父类 → 子对象 → 子类；
   * 析构顺序相反。
6. **多重继承**：

   * 声明形式与构造函数；
   * 同名成员的二义性及作用域限定解决办法；
   * 菱形继承与虚基类，虚基类只保留一份共同父类。
7. **父类与子类的类型转换**：

   * B→A 的赋值、引用、形参、指针转换；
   * 对象切片问题；指向父类的指针指向子类对象时，只能访问父类部分（未用虚函数时）。
8. **继承与组合**：

   * 继承：is-a，带来类型兼容；
   * 组合：has-a，通过成员对象实现；
   * 两者都是重要的代码重用方式。
9. **继承在软件开发中的意义**：

   * 提高复用、降低耦合；
   * 结合类库、头文件、目标代码，支持大规模开发与维护。


