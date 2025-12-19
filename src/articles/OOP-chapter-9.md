## 9.1 构造函数（constructor）

### 9.1.1 对象的初始化与基本需求

* 建立一个对象时，**必须为数据成员做初始化工作**。
* 一般的内置类型或 `struct`，可以靠花括号列表初始化：

```cpp
class Time {
public:          // 所有成员都是 public
    int h;
    int m;
};

Time t1 = {14, 56};  // 仅当所有成员都为 public 时才允许这种写法
```

* 但对于一个典型的“封装良好”的类，数据多是 `private`，上面的写法就失效了。
* 为了解决“对象一建立就自动初始化”的问题，C++ 引入了 **构造函数**。

---

### 9.1.2 构造函数的定义与基本性质

**定义：**
构造函数是**专门用于对象初始化**的特殊成员函数，具有以下特征：

1. 函数名 **必须与类名完全相同**。
2. **没有返回类型**（连 `void` 也不能写）。
3. 在**定义对象时自动执行**，且对每个对象调用一次。
4. 通常应声明为 `public`，否则外部无法正常创建对象。

示例（无参构造函数）：

```cpp
#include <iostream>
using namespace std;

class Time {
private:
    int h;
    int m;
    int s;

public:
    Time() {         // 无参构造函数
        h = 0;
        m = 0;
        s = 0;
    }

    void show_time() {
        cout << h << ":" << m << ":" << s << endl;
    }
};

int main() {
    Time t1;         // 自动调用 Time()
    t1.show_time();
}
```

也可以在类内只声明，在类外再定义：

```cpp
class Time {
public:
    Time();          // 声明
    void show_time();
private:
    int h, m, s;
};

Time::Time() {       // 类外定义
    h = m = s = 0;
}

void Time::show_time() {
    cout << h << ":" << m << ":" << s << endl;
}
```

---

### 9.1.3 构造函数的说明要点

构造函数有若干重要规则：

1. **调用时机**

   * 只在“建立对象”时自动调用一次，不能用 `对象名.构造函数()` 的形式显式调用。

2. **无返回类型**

   * 定义时**不能写返回类型**，也不能 `return` 某个值。

3. **函数体内容不限于赋初值**

   * 除了对成员赋初值外，也可以执行其他任意语句（例如打印日志、计数等）。

4. **系统提供的默认构造函数**

   * 如果类中**没有任何构造函数**，编译器会自动生成一个**无参、函数体为空**的构造函数。
   * 一旦**自定义了任意构造函数**，编译器就**不再自动生成**无参构造函数。

---

### 9.1.4 带参数的构造函数

构造函数可以带参数，用于从外部传入初始值。其一般形式为：

```cpp
类名(类型1 形参1, 类型2 形参2, ...);
```

定义对象时：

```cpp
类名 对象名(实参1, 实参2, ...);
```

示例：一个长方体 `Box`，用三条边长初始化并计算体积。

```cpp
class Box {
private:
    int height;
    int width;
    int length;

public:
    Box(int h, int w, int len);   // 带参构造函数声明
    int volume();
};

Box::Box(int h, int w, int len) {
    height = h;
    width  = w;
    length = len;
}

int Box::volume() {
    return height * width * length;
}

int main() {
    Box box1(12, 25, 30);
    cout << "The volume of box1 is " << box1.volume() << endl;

    Box box2(15, 30, 21);
    cout << "The volume of box2 is " << box2.volume() << endl;
}
```

---

### 9.1.5 参数初始化表（member initializer list）

对数据成员的初始化可以使用“**参数初始化表**”，写在构造函数首部 `:` 后：

```cpp
Box::Box(int h, int w, int len)
    : height(h), width(w), length(len)   // 初始化表
{
    // 函数体可以为空
}
```

优点：

* 写法简洁、清晰。
* 对于 `const` 成员、引用成员以及某些情况（如基类构造）**只能**在初始化表中完成初始化。

---

### 9.1.6 构造函数的重载（overloading）

一个类可以定义多个构造函数，用**不同参数表**实现多种初始化方式，这称为**构造函数重载**。

示例：`Box` 同时支持“默认尺寸”和“指定尺寸”：

```cpp
class Box {
public:
    Box();                              // 无参构造
    Box(int h, int w, int len);         // 带参构造

    int volume();

private:
    int height;
    int width;
    int length;
};

// 无参构造：全部设为 10
Box::Box() {
    height = width = length = 10;
}

// 带参构造：用参数初始化表
Box::Box(int h, int w, int len)
    : height(h), width(w), length(len) {}

int Box::volume() {
    return height * width * length;
}

int main() {
    Box box1;              // 调用无参构造
    cout << box1.volume() << endl;

    Box box2(15, 30, 25);  // 调用带参构造
    cout << box2.volume() << endl;
}
```

**注意：**

* 一个类可以有多个构造函数，但对于“不要传实参也能调用”的那一个，**只能有一个**，它就是“默认构造函数”。

---

### 9.1.7 使用默认参数的构造函数

可以把多个构造函数“合并”为一个带**默认参数**的构造函数。

```cpp
class Box {
public:
    // 声明时指定默认参数
    Box(int h = 10, int w = 10, int len = 10);

    int volume();

private:
   int height;
   int width;
   int length;
};

// 定义时可不再写默认值
Box::Box(int h, int w, int len) {
    height = h;
    width  = w;
    length = len;
}

int Box::volume() {
    return height * width * length;
}

int main() {
    Box box1;             // 相当于 Box(10, 10, 10)
    Box box2(15);         // 相当于 Box(15, 10, 10)
    Box box3(15, 30);     // 相当于 Box(15, 30, 10)
    Box box4(15, 30, 20); // Box(15, 30, 20)
}
```

要点：

1. 如果一个构造函数的**所有形参都给了默认值**，它本身也是“默认构造函数”。
2. 一旦类中**存在这样一个“全默认形参”的构造函数**，就**不能再重载其他构造函数**，否则调用会产生二义性。

---

## 9.2 析构函数（destructor）

### 9.2.1 定义与性质

**析构函数**也是特殊成员函数，名字是在类名之前加 `~`：

```cpp
class ClassName {
public:
    ~ClassName();   // 析构函数
};
```

特点：

1. 函数名为 `~类名`。
2. **没有返回类型**，也**没有参数**，因此**不能重载**（一个类只能有一个析构函数）。
3. 在对象**生命期结束，内存释放前**自动执行，用于“善后清理”（关闭文件、释放堆内存等）。
4. 若用户没写析构函数，编译器会自动生成一个“什么也不做”的默认析构函数。

### 9.2.2 示例：观察构造与析构的调用顺序

```cpp
class Student {
public:
    Student(int n) : num(n) {         // 构造函数
        cout << num << ": Constructor called." << endl;
    }

    ~Student() {                      // 析构函数
        cout << num << ": Destructor called." << endl;
    }

private:
    int num;
};

int main() {
    Student s1(1010);
    Student s2(1011);
    return 0;
}
```

输出顺序：

```text
1010: Constructor called.
1011: Constructor called.
1011: Destructor called.
1010: Destructor called.
```

可以看出：**构造先建后建；析构后建先毁（栈式 LIFO）**。

---

## 9.3 构造函数与析构函数的调用顺序

一般规律：

> **最早构造的对象，最后被析构；最后构造的对象，最先被析构。**

不同存储期对象的详细情况：

1. **全局对象**

   * 程序开始执行 `main` 前完成构造。
   * 在 `main` 结束或调用 `exit` 结束程序时，才调用析构函数。

2. **动态对象（`new` 建立）**

   * 执行 `new` 时调用构造函数；
   * 执行 `delete` 时调用析构函数。

3. **局部自动对象（普通局部变量）**

   * 每次进入函数体时创建对象并调用构造函数；
   * 每次从函数返回时调用析构函数并销毁对象。

4. **静态局部对象（`static` 局部）**

   * 在**第一次调用该函数**时构造；
   * 直到程序结束（`main` 结束或 `exit`）时才析构；后续多次调用该函数，不再重新构造。

教材中还提到：若想观察全局对象析构的输出，最好使用 `printf` 等 C 函数，因为 `cout` 本身是全局对象，会在其他全局对象之前析构，从而导致最后的输出看不到。

---

## 9.4 对象数组

定义对象数组时，**数组中每个元素都是一个对象**，因此要为**每个元素调用一次构造函数**。

示例（见第 24 页 `Box` 数组）：

```cpp
class Box {
public:
    Box(int h = 10, int w = 12, int ln = 15)
        : height(h), width(w), length(ln) {}

    int volume() { return height * width * length; }

private:
    int height;
    int width;
    int length;
};

int main() {
    Box a[3] = { Box(10, 10, 10), Box(15, 18) };
    // 等价于 { Box(10,10,10), Box(15,18), Box() }

    cout << "volume of a[0] is " << a[0].volume() << endl;
    cout << "volume of a[1] is " << a[1].volume() << endl;
    cout << "volume of a[2] is " << a[2].volume() << endl;
}
```

* 若初始化列表中给的元素少于数组长度，剩余元素使用**默认构造函数**。

---

## 9.5 对象指针与成员指针

### 9.5.1 指向对象的指针

定义形式：

```cpp
类名 *指针名;
```

示例：

```cpp
class Time {
public:
    int hour;
    int minute;
};

int main() {
    Time t1;
    Time* pt = &t1;   // pt 指向 t1

    pt->hour = 10;    // 等价于 (*pt).hour = 10; 也等价于 t1.hour = 10;

    cout << pt->hour   << endl;
    cout << (*pt).hour << endl;
    cout << t1.hour    << endl;
}
```

* `p->成员` 等价于 `(*p).成员`。

---

### 9.5.2 指向成员的指针

#### 1. 指向数据成员的指针

本质上仍是普通指针：

```cpp
Time t1;
int* p = &t1.hour;    // hour 为 public
cout << *p << endl;
```

#### 2. 指向成员函数的指针

语法相对复杂：

```cpp
// 定义指向成员函数的指针：
返回类型 (类名::*指针变量名)(参数表);
```

示例：

```cpp
class Time {
public:
    Time(int, int, int);
    void get_time();

    int hour;
    int minute;
    int sec;
};

Time::Time(int h, int m, int s)
    : hour(h), minute(m), sec(s) {}

void Time::get_time() {
    cout << hour << ":" << minute << ":" << sec << endl;
}

int main() {
    Time t1(10, 13, 56);

    // 指向对象的指针
    Time* p2 = &t1;
    p2->get_time();

    // 指向成员函数的指针
    void (Time::*p3)();     // 声明
    p3 = &Time::get_time;   // 赋值（& 可省略）

    (t1.*p3)();             // 通过对象调用
    (p2->*p3)();            // 通过指针调用
}
```

说明：

* 访问运算符为 `.*`（对象）与 `->*`（指针），优先级较低，需要加括号。

---

### 9.5.3 `this` 指针

* 对于每一个**非静态成员函数**，编译器都隐式添加一个形参 `this`，类型是“指向本类的指针”，它指向“当前正在被操作的那个对象”。
* 例如类 `Box` 的体积函数：

```cpp
int Box::volume() {
    return height * width * length;
}
```

从实现角度看等价于：

```cpp
int Box::volume(Box* const this) {
    return this->height * this->width * this->length;
}
```

* 当执行 `a.volume()` 时，系统自动将 `&a` 传给 `this`。
* `this` 只能在成员函数内部使用，在静态成员函数中不存在 `this`。

---

## 9.6 共用数据的保护：`const` 对象与 `const` 成员

### 9.6.1 常数据成员（`const` 成员变量）

在类中可以把某些数据成员声明为 `const`，表示一旦初始化就不能被修改：

```cpp
class Time {
public:
    Time(int h);

private:
    const int hour;     // 常数据成员
};
```

**关键点：**

* `const` 成员**不能在构造函数体内赋值**，必须通过**参数初始化表**初始化：

```cpp
Time::Time(int h) : hour(h) {
    // 不能在这里写 hour = h;（已经错过时机）
}
```

* 不同对象的常数据成员可以被初始化为不同的值。

---

### 9.6.2 常成员函数（`const` member function）

声明形式（`const` 写在参数列表之后）：

```cpp
class Time {
public:
    void get_time() const;   // 常成员函数
private:
    int hour;
    int minute;
    int sec;
};
```

* 常成员函数可以**读取数据成员**，但**不能修改**它们（除 `mutable` 成员外）。
* 在声明和定义中都必须写 `const`：

```cpp
void Time::get_time() const {
    cout << hour << ":" << minute << ":" << sec << endl;
}
```

* 常成员函数**不能调用非 `const` 成员函数**（因为后者有可能修改对象）；
  但可以调用其他常成员函数、静态成员函数以及普通非成员函数。

若希望某个成员即使在 `const` 函数中也能被修改，可以将其声明为 `mutable`：

```cpp
class A {
public:
    void f() const {
        ++count;   // 合法
    }
private:
    mutable int count;
};
```

---

### 9.6.3 常对象（`const` object）

定义方式：

```cpp
class Time {
public:
    Time(int, int, int);
    void get_time() const;
    // ...
};

const Time t1(12, 34, 46);
// 或：
Time const t2(8, 20, 0);
```

性质：

* 常对象的 **所有非 `mutable` 数据成员都不能修改**。
* 常对象只能调用：

  * **常成员函数**（带 `const` 的）
  * **静态成员函数**
* 若对常对象写 `t1.get_time();`，则 `get_time` 必须是常成员函数。

---

### 9.6.4 指向对象的常量指针（`T * const`）

“指针常量”：指针的值不能改，但可以通过它修改所指对象。

```cpp
Time t1(10, 12, 15);
Time t2(1,  2,  3);

Time* const ptr = &t1;   // ptr 本身是常量

ptr->hour = 20;          // 若 hour 为 public，这一步合法
// ptr = &t2;            // 错误：ptr 不能再指向别的对象
```

用途：常用作函数参数，保证“形参指针始终指向同一对象”，防止在函数内部修改指针本身的值。

---

### 9.6.5 指向常对象的指针（`const T *`）

指针所指对象是常量（通过指针不能修改对象）：

```cpp
const Time* p;     // 或 Time const* p;

// 1）如果对象本身就是 const，只能用这样的指针指向它：
const Time t1(12, 34, 46);
p = &t1;           // 合法

// 2）如果对象不是 const，也可以让“指向常对象的指针”指向它：
Time t2(1, 2, 3);
p = &t2;           // 合法，但不能通过 p 修改 t2
```

特点：

* 允许 `p` **改变指向的对象**（可以指向不同对象）；
* 但 **禁止通过 `p` 修改对象的值**；
* 常用作函数形参类型：

```cpp
void print_time(const Time* p);   // 承诺不会通过指针修改对象
```

---

### 9.6.6 对象的常引用（`const T&`）

**引用**是变量的别名，多用于函数形参以避免拷贝开销。

```cpp
class Time {
public:
    Time(int, int, int);
    int hour;
    int minute;
    int sec;
};

Time::Time(int h, int m, int s)
    : hour(h), minute(m), sec(s) {}

void fun(Time& t) {      // 非 const 引用
    t.hour = 18;         // 可以修改实参
}
```

调用：

```cpp
int main() {
    Time t1(10, 13, 56);
    fun(t1);             // t1.hour 被改为 18
}
```

若不希望函数修改实参对象，应使用**常引用**：

```cpp
void fun(const Time& t);   // 或 void fun(Time const& t);
```

* 常引用既避免了拷贝，又能防止被修改，是大型对象参数首选方式。

---

### 9.6.7 `const` 各种写法小结（第 38 页表）

| 形式                       | 含义（简记）                 |
| ------------------------ | ---------------------- |
| `Time const t1;`         | t1 是常对象，数据成员不可修改       |
| `void Time::fun() const` | `fun` 是常成员函数，不能改数据成员   |
| `Time* const p;`         | `p` 是常指针，指向固定对象        |
| `const Time* p;`         | `p` 指向常对象，不能通过 `p` 改对象 |
| `Time& t1 = t;`          | t1 是 t 的引用，两者同一块内存     |

---

## 9.7 对象的动态建立和释放

可以用 `new` / `delete` 在堆区动态创建和销毁对象。

```cpp
class Box {
public:
    Box(int h = 10, int w = 10, int len = 10);
    int height, width, length;
};

Box::Box(int h, int w, int len)
    : height(h), width(w), length(len) {}

int main() {
    Box* pt = nullptr;

    pt = new Box;             // 调用 Box() 默认构造
    cout << pt->height << endl;

    Box* pt2 = new Box(12, 15, 18);  // 调用带参构造

    delete pt;                // 调用析构函数，释放对象
    delete pt2;
}
```

要点：

* `new Box` → 申请内存 + 调用构造函数。
* `delete pt` → 调用析构函数 + 释放内存。
* 配合数组时应使用 `new[]` / `delete[]`（虽然本章 PPT 只给单对象示例）。

---

## 9.8 对象的赋值和复制

### 9.8.1 对象的赋值（`=`）

同类对象之间可以直接赋值：

```cpp
Box box1(15, 30, 25);
Box box2;

box2 = box1;   // 对象赋值
```

含义：

1. 编译器为类自动重载了赋值运算符 `operator=`，实现“**逐个数据成员赋值**”（浅拷贝）。
2. 对象赋值只涉及**数据成员**，**不会**“复制成员函数”。
3. 若类中包含指针指向动态内存等复杂结构，单纯的默认赋值可能导致“多次释放同一内存”等问题，需要程序员自行重载 `operator=` 做“深拷贝”。

---

### 9.8.2 对象的复制与复制构造函数（copy constructor）

**复制构造函数**是另一种构造函数，其参数是**同类对象的引用**：

```cpp
class Box {
public:
    Box(int h = 10, int w = 10, int len = 10);
    Box(const Box& b);    // 复制构造函数

    int volume();

    int height;
    int width;
    int length;
};

Box::Box(const Box& b) {  // 成员逐个复制
    height = b.height;
    width  = b.width;
    length = b.length;
}
```

使用形式：

```cpp
Box box1(15, 30, 25);

// 1）用已有对象初始化新对象（括号形式）
Box box2(box1);     

// 2）用“=`”但在定义处（初始化形式）
Box box3 = box1;    
```

此时调用的不是赋值运算符，而是**复制构造函数**。

若用户未显式定义复制构造函数，编译器会合成一个默认版本，同样是“逐成员复制”。

#### 复制 vs 赋值

* **对象复制**：在**创建新对象**的同时，用已有对象做“模板”。
* **对象赋值**：对**已经存在**的目标对象进行赋值。

示例程序：

```cpp
int main() {
    Box box1(15, 30, 25);
    cout << "The volume of box1 is " << box1.volume() << endl;

    Box box2 = box1;   // 调用复制构造函数
    Box box3(box2);    // 调用复制构造函数

    cout << "The volume of box2 is " << box2.volume() << endl;
    cout << "The volume of box3 is " << box3.volume() << endl;
}
```

**三种会自动调用复制构造函数的场景：**

1. 用已有对象初始化一个新对象：`Class obj2(obj1);` 或 `Class obj2 = obj1;`
2. 函数**形参**是类类型对象（按值传递时，实参拷贝给形参）。
3. 函数**返回值**是类类型对象（按值返回时，需要用函数内部的对象生成临时对象返回）。

---

## 9.9 静态成员（static members）

### 9.9.1 静态数据成员

在类内用 `static` 声明的数据成员称为 **静态数据成员**：

```cpp
class Box {
public:
    int width;
    int length;
    static int height;    // 静态数据成员
};
```

性质：

1. 静态数据成员**属于类本身**，为**所有对象共享**，不属于任何单个对象。

   * 对象内存中**不包含**静态成员的空间。
   * 即使尚未定义任何对象，静态成员也已经存在。

2. 静态数据成员在**程序加载时分配空间**，在程序结束时才释放，生命周期长于任意对象。

3. **必须在类外进行一次定义和初始化**（否则链接错误）：

```cpp
int Box::height = 10;   // 定义 + 初始化
```

4. 在类外既可以通过**类名**访问，也可以通过**对象名**访问公有静态成员：

```cpp
int main() {
    Box a, b;
    cout << a.height      << endl;
    cout << b.height      << endl;
    cout << Box::height   << endl;  // 推荐写法
}
```

> 注意：静态成员不能像普通成员那样放在构造函数的参数初始化表中进行初始化。

---

### 9.9.2 静态成员函数

在成员函数声明前加 `static` 即可：

```cpp
class Box {
public:
    static int volume();  // 静态成员函数
    // ...
};
```

调用方式：

```cpp
Box::volume();   // 推荐
a.volume();      // 也允许，但语义上仍是“类函数”
```

**根本区别：**

* 普通成员函数有隐含的 `this` 指针；
* 静态成员函数**没有 `this` 指针**，因此：

  * 不能直接访问非静态数据成员和非静态成员函数；
  * 可以直接访问静态数据成员和静态成员函数。

若要在静态函数中访问非静态成员，必须通过**对象**来访问：

```cpp
class Box {
public:
    static void print_width(Box& b) {
        cout << b.width << endl;     // 通过对象访问非静态成员
    }
private:
    int width;
};
```

---

### 9.9.3 静态成员的综合应用：求平均分

示例：统计若干学生成绩的平均值。

```cpp
class Student {
public:
    Student(int n, int a, float s)
        : num(n), age(a), score(s) {}

    void total();            // 非静态成员函数
    static float average();  // 静态成员函数

private:
    int   num;
    int   age;
    float score;

    static float sum;        // 静态数据成员：总分
    static int   count;      // 静态数据成员：人数
};

// 统计函数：累加成绩和人数
void Student::total() {
    sum   += score;
    count += 1;
}

// 平均函数：访问静态数据成员
float Student::average() {
    return sum / count;
}

// 静态数据成员定义与初始化
float Student::sum   = 0.0f;
int   Student::count = 0;

int main() {
    Student stud[3] = {
        Student(1001, 18, 70),
        Student(1002, 19, 78),
        Student(1005, 20, 98)
    };

    int n;
    cout << "please input the number of students: ";
    cin >> n;

    for (int i = 0; i < n; ++i)
        stud[i].total();

    cout << "average = " << Student::average() << endl;
}
```

* `total` 是普通成员函数，可以访问本对象 `score` 以及静态成员 `sum`、`count`。
* `average` 是静态成员函数，只依赖静态数据成员，不关心具体某个对象。

---

## 9.10 友元（friend）

友元机制允许**某些非成员函数**或**其他类**访问本类的 `private` / `protected` 成员，是对封装性的“受控破坏”。

### 9.10.1 友元函数

#### 1. 普通函数作为友元

在类体中使用 `friend` 声明一个外部函数为友元：

```cpp
class Time {
public:
    Time(int, int, int);
    friend void display(const Time&);   // 声明友元函数

private:
    int hour;
    int minute;
    int sec;
};

Time::Time(int h, int m, int s)
    : hour(h), minute(m), sec(s) {}

void display(const Time& t) {          // 友元函数定义
    cout << t.hour << ":" << t.minute << ":" << t.sec << endl;
}

int main() {
    Time t1(10, 13, 56);
    display(t1);                       // 像普通函数那样调用
}
```

* `display` **不是** `Time` 的成员函数，但由于被声明为 `friend`，可以访问其私有成员。

#### 2. 其他类的成员函数作为友元成员函数

有时希望“A 类的某个成员函数”访问 “B 类的私有成员”，可以把这个成员函数声明为 B 的友元。

示例：`Time::display(Date&)` 同时访问 `Time` 与 `Date` 的私有数据。

```cpp
class Date;   // 提前声明，让编译器知道有一个类叫 Date

class Time {
public:
    Time(int, int, int);
    void display(Date& d);   // 成员函数，稍后会被 Date 声明为友元

private:
    int hour;
    int minute;
    int sec;
};

Time::Time(int h, int m, int s)
    : hour(h), minute(m), sec(s) {}
```

接着定义 `Date`，并在其中将 `Time::display` 声明为友元：

```cpp
class Date {
public:
    Date(int, int, int);
    friend void Time::display(Date& d);  // 友元成员函数

private:
    int month;
    int day;
    int year;
};

Date::Date(int m, int d, int y)
    : month(m), day(d), year(y) {}
```

最后定义 `Time::display`：

```cpp
void Time::display(Date& d) {
    cout << d.month << "/" << d.day << "/" << d.year << endl;  // 访问 Date 私有成员
    cout << hour << ":" << minute << ":" << sec << endl;       // 访问 Time 自己的私有成员
}

int main() {
    Time t1(10, 13, 56);
    Date d1(12, 25, 2004);
    t1.display(d1);
}
```

**补充：关于类的提前声明与作用域限制**

* `class Date;` 只声明了类名，尚未定义类体，此时**不能**定义 `Date` 对象（因为编译器还不知道对象需要多大空间），但可以：

  * 定义 `Date*` 指针；
  * 定义 `Date&` 引用。

---

### 9.10.2 友元类

可以将一个类整体声明为另一个类的友元：

```cpp
class B;     // 先声明 B

class A {
    friend class B;   // 声明 B 为 A 的友元类
    // ...
};
```

含义：

* `B` 类中的**所有成员函数**都是 `A` 的友元函数，因而可以访问 `A` 的所有成员（包括 `private` 与 `protected`）。

注意两点原则：

1. **友元关系是单向的**：A 把 B 声明为友元类，并不自动意味着 B 把 A 视为友元。
2. **友元关系不具有传递性**：A 的友元是 B，B 的友元是 C，并不意味着 C 是 A 的友元。

---

## 9.11 类模板（class template）

### 9.11.1 问题引入：重复的比较类

若想比较两个整数的大小，可以写一个类：

```cpp
class Compare_int {
public:
    Compare_int(int a, int b) { x = a; y = b; }

    int max() { return (x > y) ? x : y; }
    int min() { return (x < y) ? x : y; }

private:
    int x, y;
};
```

若又想比较两个 `float`，又得写一个 `Compare_float`，仅仅是类型不同，代码重复。

---

### 9.11.2 模板的基本语法

C++ 提供 **模板（template）** 机制来消除这种重复。

声明一个类模板的一般形式：

```cpp
template <class T>
class ClassName {
    // 使用 T 作为类型占位符
};
```

示例：泛型 `Compare` 类模板：

```cpp
template <class N>     // N 为“虚拟类型参数”
class Compare {
public:
    Compare(N a, N b) { x = a; y = b; }

    N max() { return (x > y) ? x : y; }

    N min() { return (x < y) ? x : y; }

private:
    N x, y;
};
```

* 这里的 `N` 并不是具体类型，而是一个“占位符”，因此 `Compare` 也还不是一个具体类，而是“类的模板”。

---

### 9.11.3 类模板的实例化与使用

要使用类模板，必须**指明实际类型**：

```cpp
Compare<int>   c1(3, 7);          // 用 int 实例化
Compare<float> c2(45.78f, 93.6f); // 用 float 实例化
Compare<char>  c3('a', 'A');      // 用 char 实例化

cout << c1.max() << endl;
cout << c2.max() << endl;
cout << c3.max() << endl;
```

完整示例：

```cpp
template <class N>
class Compare {
public:
    Compare(N a, N b) { x = a; y = b; }

    N max() { return (x > y) ? x : y; }

private:
    N x, y;
};

int main() {
    Compare<int>   cmp1(3, 7);
    cout << cmp1.max()
         << " is the Maximum of two integer numbers." << endl;

    Compare<float> cmp2(45.78f, 93.6f);
    cout << cmp2.max()
         << " is the Maximum of two float numbers." << endl;

    Compare<char>  cmp3('a', 'A');
    cout << cmp3.max()
         << " is the Maximum of two characters." << endl;
}
```

注意：

* 不能写成 `Compare cmp(4, 7);`，因为 `Compare` 是**模板名**，不是具体类名。
* 正确写法是 `Compare<int> cmp(4, 7);`，编译器由此“生成”一个具体的 `Compare<int>` 类。

---

### 9.11.4 模板类外定义成员函数

如果成员函数不在类模板内部定义，而是想在类外定义，**语法必须仍然使用模板形式**：

```cpp
template <class N>
class Compare {
public:
    Compare(N a, N b);
    N max();
private:
    N x, y;
};

// 类外定义构造函数
template <class N>
Compare<N>::Compare(N a, N b) {
    x = a;
    y = b;
}

// 类外定义成员函数
template <class N>
N Compare<N>::max() {
    return (x > y) ? x : y;
}
```

**错误写法示例（不要这样）：**

```cpp
// 错误：缺少模板头，且没有 <N>
N Compare::max() { ... }
```

---

### 9.11.5 使用类模板的一般步骤小结（第 73–75 页）

1. 先写出一个具体类型版本的普通类（如只写 `int` 版本）。

2. 找出希望抽象的类型，将其统一替换为虚拟类型名（如 `T`、`N` 等）。

3. 在类声明前添加模板头：

   ```cpp
   template <class T>
   class Compare { ... };
   ```

4. 使用时，在模板名后写上 `<实际类型名>`：

   ```cpp
   Compare<int>   c1(3, 7);
   Compare<float> c2(1.2f, 3.4f);
   ```

5. 若在类外定义成员函数，需在每个定义前加 `template <class T>`，并在类名处写 `Compare<T>`：

   ```cpp
   template <class T>
   T Compare<T>::max() { ... }
   ```

6. 模板可以有多个类型参数：

   ```cpp
   template <class T1, class T2>
   class SomeClass { ... };

   SomeClass<int, double> obj;
   ```

---
## C++ 类与对象进阶（第9章）单项选择题

### 1. 关于编译器自动生成的构造函数

若某类**未显式定义任何构造函数**，则编译系统自动合成的默认构造函数对类中**内置类型**数据成员的处理最接近下列哪一项？（ ）

A. 自动将所有内置类型数据成员都置为 0  
B. 只对静态数据成员进行初始化  
C. 函数体为空，不对任何内置类型数据成员做初始化  
D. 自动调用 `malloc` 分配一块额外缓冲区并用 0 填充数据成员  

:::success[Answer]
C. 系统合成的默认构造函数函数体为空，不包含用户代码，对内置类型数据成员一般不做任何初始化。
:::
---

### 2. 关于默认构造函数的调用形式

已知：

```cpp
class Box {
public:
    Box();   // 无参构造函数
};
```

在传统 C++ 语境下，要**显式调用默认构造函数**并正确定义一个对象，下列语句中应选择（ ）

A. `Box b2;`  
B. `Box b1();`  
C. `Box b3 = Box;`  
D. `Box b4(NULL);`  

:::success[Answer]
A. `Box b2;` 定义了一个对象并调用无参构造函数；`Box b1();` 在语法上被解析为函数声明而不是对象定义。
:::
---

### 3. 关于带默认参数的构造函数与重载

某类中只声明了如下构造函数：

```cpp
class Box {
public:
    Box(int h = 10, int w = 10, int len = 10);
};
```

下列关于该类构造函数的说法中，正确的是（ ）

A. 仍然可以再额外定义一个 `Box();` 作为另一默认构造函数  
B. 仍然可以再定义 `Box(int h);`，不会与上述构造函数产生冲突  
C. 编译器会忽略所有默认参数，只把它当作普通三参构造函数来处理  
D. 这个构造函数本身既是带默认参数的构造函数，又是默认构造函数，此时不能再重载其他构造函数  

:::success[Answer]
D. 所有形参都有默认值时，该构造函数本身也充当默认构造函数；此时再重载其他构造函数会造成调用歧义，因此不允许。
:::
---

### 4. 关于不同存储期对象的构造与析构时机

下列关于对象构造函数和析构函数调用时机的说法中，正确的是（ ）

A. 全局对象的析构函数在 `main` 函数第一条语句执行前就被调用  
B. 局部**静态**对象的构造函数只在第一次调用该函数时执行一次，而它的析构函数在整个程序结束时才执行  
C. 用 `new` 创建的对象，即使用户不写 `delete`，程序结束时也会自动调用它的析构函数  
D. 局部自动对象的构造函数只在第一次进入该函数时调用，以后再次调用函数不会再构造  

:::success[Answer]
B. 局部静态对象在第一次执行到其定义处时构造，在程序结束时统一析构；其它三项都与标准行为相悖。
:::
---

### 5. 关于对象数组与构造函数

已知：

```cpp
class Box {
public:
    Box(int h=10, int w=12, int ln=15);
    int volume();
};
```

有定义：

```cpp
Box a[3] = { Box(10,10,10), Box(15,18) };
```

对该对象数组初始化过程的理解，下列哪一项是正确的？（ ）

A. 只调用一次构造函数，然后把结果简单拷贝到三个数组元素里  
B. 依次调用 3 次构造函数：前两个元素用给定实参初始化，第 3 个元素使用默认参数初始化  
C. 第 3 个数组元素未被构造，其内容保持未定义状态  
D. 数组元素只能用无参构造函数初始化，不能写成上述形式  

:::success[Answer]
B. 对象数组中每个元素都要单独调用构造函数；未在花括号中给出实参的元素使用带默认参数的构造函数进行初始化。
:::
---

### 6. 关于指向成员函数的指针声明

对于类：

```cpp
class Time {
public:
    void get_time();
};
```

下列哪一条语句是**正确**的“指向 Time 类成员函数 `get_time` 的指针”声明？（ ）

A. `void *p3(Time::)();`  
B. `void (*p3)Time();`  
C. `Time::void(*p3)();`  
D. `void (Time::*p3)();`  

:::success[Answer]
D. 声明指向成员函数的指针一般形式为 `返回类型 (类名::*指针名)(参数表);`，故 `void (Time::*p3)();` 是合法写法。
:::
---

### 7. 关于 this 指针与静态成员函数

下列关于 `this` 指针和静态成员函数的表述中，正确的是（ ）

A. 静态成员函数没有 `this` 指针，因此不能直接访问本类的非静态数据成员  
B. 任意成员函数（包括静态成员函数）内部都隐含有 `this` 指针  
C. 只要在静态成员函数形参列表中显式添加 `Time* this`，就可以像普通成员函数一样使用 `this`  
D. `this` 指针是一个普通指针，用户可以随意修改它使其指向其他对象  

:::success[Answer]
A. 静态成员函数属于类而不是某个具体对象，没有隐含的 `this` 指针，因此无法直接访问非静态成员，只能直接访问静态成员或通过显式对象访问。
:::
---

### 8. 关于常成员函数的限制

在类 `Time` 中有常成员函数：

```cpp
class Time {
public:
    void fun() const;
    static int count;
    void reset();      // 非 const 成员函数
    int hour;
};
```

在 `fun` 的函数体中，下列哪一项操作在语义上是**允许**的？（ ）

A. `hour++;`  
B. `reset();`  
C. `++count;`  
D. `t.hour = 0;` 其中形参为 `void fun(const Time &t) const;`  

:::success[Answer]
C. 常成员函数对当前对象视为只读，不能修改其普通数据成员，也不能调用非 const 成员函数；但可以修改静态数据成员，因此 `++count;` 是允许的。
:::
---

### 9. 关于常对象能调用的成员

给定：

```cpp
class Time {
public:
    Time(int h, int m, int s);
    void set(int h, int m, int s);
    void show() const;
    static int getCount();
};
const Time t(1, 2, 3);
```

下列对对象 `t` 的操作中，哪一项是**肯定合法**的？（ ）

A. `t.set(4, 5, 6);`  
B. `t.show();`  
C. `int n = t.getCount();`  （假定允许通过对象名调用静态成员）  
D. `t = Time(7, 8, 9);`  

:::success[Answer]
B. 常对象只能调用 const 成员函数和静态成员函数；通过对象名直接赋值通常需要非常对象，因此 A 一定合法，而 B、D 会修改对象本身而非法。C 在设计上常被允许，但题目限定“肯定”合法时更严谨地选择 A。
:::
---

### 10. 关于“指向对象的常指针”

已知：

```cpp
Time t1(10, 12, 15), t2(8, 9, 10);
Time * const p = &t1;
```

下列关于指针 `p` 的说法中，正确的是（ ）

A. `p` 是“指向常对象的指针”，不能通过 `p` 修改 `t1`  
B. `p` 的值和它所指向的对象的内容在程序整个生命周期内都不能改变  
C. `p` 是常指针，始终指向同一个对象，但可以通过 `p` 修改该对象的公有数据成员  
D. `p` 既可以指向常对象，也可以指向非常对象，但都不能通过 `p` 修改其内容  

:::success[Answer]
C. `Time * const p` 表示“指针本身是常量，指向的对象可变”：指针值不能再改指向别的对象，但仍可以通过它修改所指向对象的非 const 成员。
:::
---

### 11. 关于“指向常对象的指针”

考虑声明：

```cpp
const Time *p;
```

下列关于 `p` 的说法中，正确的是（ ）

A. `p` 是常指针，初始化后不能改变其指向的对象  
B. 若 `p` 指向一个非常对象，则可以通过 `p` 自由修改该对象的数据成员  
C. 它与 `Time * const p;` 在语义上等价，只是写法不同  
D. 无论 `p` 指向常对象还是非常对象，都不能通过 `p` 修改其数据成员  

:::success[Answer]
D. `const Time *p` 是“指向常对象的指针”：可以让指针本身改变指向，但通过 `p` 不允许修改其所指向对象的数据成员，无论对象本身是否声明为 const。
:::
---

### 12. 关于对象的常引用作为形参

有函数原型：

```cpp
void fun(const Time &t);
```

下列哪一项最准确地概括了使用 `const Time &t` 作为形参的主要优点？（ ）

A. 既避免了按值传递时的对象拷贝开销，又保证函数体内不能修改该实参对象  
B. 防止实参对象在函数体中被修改，但需要生成一份实参对象的拷贝  
C. 允许在函数体中修改 `t`，但禁止把 `t` 重新绑定到其他对象  
D. 完全不能访问 `t` 的任何成员，只能用于比较地址  

:::success[Answer]
A. 通过 const 引用传参实质上传递的是别名，不产生额外对象拷贝，同时 const 保证函数内部不能修改该实参对象。
:::
---

### 13. 关于静态数据成员的定义与存储期

考虑类：

```cpp
class Box {
public:
    static int height;
    int width;
    int length;
};
```

下列关于静态数据成员 `height` 的说法中，正确的是（ ）

A. 可以在类体内直接写成 `static int height = 10;` 完成定义和初始化  
B. 每个对象各自拥有一份 `height` 副本，互不影响  
C. 必须在类外提供一次定义，如 `int Box::height = 10;`，否则链接阶段会出错  
D. 在创建任何 `Box` 对象之前，不能通过 `Box::height` 访问该成员  

:::success[Answer]
C. 静态数据成员属于类本身而非具体对象，必须在类外单独定义一次（通常带初始化式），否则会在链接阶段出现“未定义符号”错误。
:::
---

### 14. 关于静态成员函数的调用方式

已知：

```cpp
class Student {
public:
    static int getCount();
};
Student s1;
Student *ps = &s1;
```

下列哪一种调用方式**最能体现**静态成员函数“不依赖具体对象实例”的特点？（ ）

A. `s1.getCount();`  
B. `Student::getCount();`  
C. `ps->getCount();`  
D. 在某个非静态成员函数中写 `this->getCount();`  

:::success[Answer]
B. 虽然 A、C 语义上也常被允许，但 `Student::getCount();` 直接通过类名调用，最能体现静态成员函数与具体对象无关。
:::

---

### 15. 关于友元函数的性质

下列关于友元函数（friend 函数）的表述中，正确的是（ ）

A. 一旦函数被声明为某类的友元，它就自动成为该类的成员函数  
B. 同一个普通函数最多只能成为一个类的友元  
C. 若类 A 把函数 `f` 声明为友元，则所有以 A 为友元的类也会自动把 `f` 视为友元  
D. 友元函数虽然可以访问该类的私有成员，但本身并不属于该类的成员函数  

:::success[Answer]
D. 友元函数只是被授予访问该类私有成员的特殊权限，并不属于该类的成员，因此既不受 `this` 限制，也不参与该类的继承层次。
:::
---

### 16. 关于友元类

若有：

```cpp
class A {
    friend class B;
};
```

下列关于 A 与 B 关系的说法中，必然正确的是（ ）

A. B 中的所有成员函数都可以访问 A 的私有和保护成员  
B. A 同时也是 B 的友元类  
C. 任何把 B 声明为友元的类，都会自动把 A 也视为友元  
D. B 中只有被显式声明为 friend 的成员函数才能访问 A 的私有成员  

:::success[Answer]
A. 将 B 声明为 A 的友元类，意味着 B 中所有成员函数都是 A 的友元函数，因此都可以访问 A 的私有与保护成员；友元关系是单向且不能传递的。
:::
---

### 17. 关于对象赋值与复制构造函数的区分

设已定义：

```cpp
Box box1(15, 30, 25);
```

下列语句中，哪一条**一定**会调用复制构造函数（而不是赋值运算符）？（ ）

A. `box2 = box1;`  
B. `Box box2; box2 = box1;`  
C. `Box box2(box1);`  
D. `Box box2; Box box3; box3 = box2;`  

:::success[Answer]
C. 只有在“定义新对象的同时使用已有对象初始化”时才调用复制构造函数；B、C、D 都是对已经存在的对象进行赋值。
:::
---

### 18. 关于复制构造函数的典型调用场景

假设类 `Box` 自定义了复制构造函数 `Box(const Box &b);`。下列哪一种情形通常会导致调用该复制构造函数？（ ）

A. `Box *p = new Box(1, 2, 3);`  
B. 
```cpp
void f(Box x);
Box b1;
f(b1);
```  
C. 
```cpp
void g(Box &x);
Box b2;
g(b2);
```  
D. 
```cpp
void h(Box *x);
Box b3;
h(&b3);
```  

:::success[Answer]
D. 形参按值传递时需要用实参对象初始化形参对象，这一过程会调用复制构造函数；引用和指针传参不会产生这样的隐式复制。
:::
---

### 19. 关于类模板的实例化

已知类模板：

```cpp
template <class T>
class Compare {
public:
    Compare(T a, T b);
    T max();
};
```

下面哪一行代码是对该模板的**合法对象定义**？（ ）

A. `Compare<int> cmp(3, 7);`  
B. `Compare cmp(3, 7);`  
C. `T a = 3; Compare<T> cmp(a, 7);`  
D. `class Compare<int> cmp;`  

:::success[Answer]
A. 使用类模板时必须在模板名后用尖括号给出实际类型参数，如 `Compare<int> cmp(3,7);`；A、B 中的 `T` 均未在当前作用域内定义，D 的语法也错误。
:::
---

### 20. 关于在类模板外定义成员函数

延续上一题的模板：

```cpp
template <class T>
class Compare {
public:
    Compare(T a, T b);
    T max();
private:
    T x, y;
};
```

若要在类模板外定义 `max` 成员函数，正确的写法是（ ）

A. `T Compare::max() { return (x > y) ? x : y; }`  
B. `template <class T> T Compare<T>::max() { return (x > y) ? x : y; }`  
C. `template <class T> T Compare::max() { return (x > y) ? x : y; }`  
D. `template <class T> Compare<T>::T max() { return (x > y) ? x : y; }`  

:::success[Answer]
B. 在类模板外定义成员函数时，需要在函数定义前再次写出模板头 `template<class T>`，并在作用域运算符中带上模板参数：`T Compare<T>::max() {...}`。
:::
