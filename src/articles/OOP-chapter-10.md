# 第 10 章 运算符重载（详细复习笔记） 
## 10.1 什么是运算符重载

### 10.1.1 基本概念

* **运算符重载（operator overloading）**：
  允许 C++ 中已有的运算符（如 `+ - * / << >>` 等）**对自定义类型（类 / 结构体）重新定义含义**，使其能自然地作用于对象。
* 目的：
  让自定义类型的使用方式，更接近内置类型，使代码更直观。

例如：希望对复数类 `Complex` 直接写：

```cpp
Complex c1(3, 4), c2(5, -10), c3;
c3 = c1 + c2;        // 让 “+” 能做复数加法
```

这就需要把 `+` **重载**成“两个 `Complex` 对象相加”的含义。

---

## 10.2 运算符重载的一般形式

### 10.2.1 重载函数的语法

一个运算符重载函数的通用原型为：

```cpp
返回类型 operator 运算符号 (形参表)
{
    // 对该运算符的重载处理
}
```

例如，在 `Complex` 类中重载加号为**成员函数**：

```cpp
class Complex {
public:
    Complex(double r = 0.0, double i = 0.0)
        : real(r), imag(i) {}

    // 成员形式：重载 +
    Complex operator+(const Complex& c2) const;

    void display() const;

private:
    double real;
    double imag;
};

Complex Complex::operator+(const Complex& c2) const
{
    Complex c;
    c.real = real + c2.real;   // 等价于 this->real
    c.imag = imag + c2.imag;
    return c;
}
```

在表达式

```cpp
c3 = c1 + c2;
```

中，编译器会把 `c1 + c2` 解释为：

```cpp
c1.operator+(c2);   // 左侧对象 c1 调用自己的 operator+
```

> 重要：**重载只“增加”新含义，不会破坏原有对内置类型的语义**。对普通 `int`、`double` 等的 `+` 运算依旧是原来的含义。

---

## 10.3 重载运算符的规则

运算符重载并不是“随心所欲”，必须遵守若干语法与语义约束：

1. **不能创造新的运算符号**

   * `operator` 只能对 C++ 中已经存在的运算符进行重载，
   * 不能发明类似 `@`, `**` 等新运算符。

2. **有 5 个运算符不能被重载**

   * `.` 成员访问运算符
   * `.*` 成员指针访问运算符
   * `::` 作用域运算符
   * `sizeof` 长度运算符
   * `?:` 条件运算符

3. **不能改变运算符的“元数”**

   * 一元运算符（如 `++`、`--`、`!`）重载后仍然是一元；
   * 二元运算符（如 `+`、`-`、`*`、`/`、`==`）重载后仍然是二元。
   * 换句话说：**操作数个数不能变**。

4. **不能改变运算符的优先级和结合性**

   * 比如 `*` 总是高于 `+`，左结合；重载后也不能改变。
   * 这些是由语言语法固定的，重载只改变“怎么算”，不改变“先算谁”。

5. **重载函数的参数不能有默认值**

   * 否则会导致操作数个数在语法上可变，违背“元数固定”的规则。

6. **至少有一个参数必须是自定义类型**

   * 运算符重载的目的就是让“类的对象”参与运算，
   * 因此形参列表中至少要有一个是 **类类型对象或其引用**。
   * 不能写一个只接受 `int`、`double` 之类内置类型的重载版本去“篡改”内置运算。

7. **某些运算符通常不需要用户重载**

   * 赋值运算符 `=`：编译器默认提供“逐成员赋值”，大多数简单类就够用了（更复杂再自己重载）。
   * 取地址运算符 `&`：默认能返回对象在内存中的起始地址，一般无需重载。

8. **运算符重载函数可以是成员函数，也可以是友元（非成员）函数**

   * 但不是所有运算符两种方式都可选，有部分必须是成员或必须是非成员，见后文 10.4。

---

## 10.4 成员运算符函数 vs 友元运算符函数

### 10.4.1 成员形式的特点

* 写在类内，形式如：

  ```cpp
  返回类型 operator符号(参数列表);
  ```

* 通过隐含的 `this` 指针指向左操作数：

  * 表达式 `a + b` → `a.operator+(b)`

* 因为左操作数已经是当前对象，所以**参数个数少写一个**：

  * 对二元运算符，只写右操作数作为形参即可；

**前提限制：**

> 表达式中，**运算符左侧的操作数必须是该类对象**，否则无法用成员形式解析。

例如，要支持 `c2 + i`（复数 + 整数），可以写成员函数：

```cpp
class Complex {
public:
    Complex(double r = 0.0, double i = 0.0)
        : real(r), imag(i) {}

    // 复数 + 整数（成员形式）
    Complex operator+(int i) const {
        return Complex(real + i, imag);
    }

private:
    double real;
    double imag;
};
```

* 这样 `c2 + 5` 合法，对应 `c2.operator+(5)`；
* 但 `5 + c2` 就不行，因为左边 `5` 不是 `Complex` 对象，无法调用成员函数。

---

### 10.4.2 友元（非成员）形式的特点

有些场景左操作数不是类对象（如 `5 + c2`），就只能写**非成员函数**，若需要访问类的私有成员，则将其声明为 **友元函数**。

```cpp
class Complex {
public:
    Complex(double r = 0.0, double i = 0.0)
        : real(r), imag(i) {}

    // 声明友元形式的加号
    friend Complex operator+(int i, const Complex& c);
    friend Complex operator+(const Complex& c, int i);

private:
    double real;
    double imag;
};

// 左边是 int
Complex operator+(int i, const Complex& c)
{
    return Complex(i + c.real, c.imag);
}

// 左边是 Complex
Complex operator+(const Complex& c, int i)
{
    return Complex(c.real + i, c.imag);
}
```

此时：

* `5 + c2` → `operator+(5, c2)`
* `c2 + 5` → `operator+(c2, 5)`

这样就可以“实现交换律效果”，让两个方向都合法。

> 双目运算符要写成友元函数时，**参数表中必须有两个形参**，不能省略。

---

### 10.4.3 哪些必须是成员，哪些必须是非成员（本章要求）

从本章给出的说明出发，可以记住：

* **必须是成员函数的运算符（典型）**：

  * 赋值运算符 `operator=`
  * 下标运算符 `operator[]`
  * 函数调用运算符 `operator()`
  * 一般还包括 `->` 等和对象自身强绑定的运算符

* **只能是非成员（通常配合友元）的运算符**：

  * 流插入、流提取：`operator<<`、`operator>>`
  * 类型转换函数 `operator type()`（本章给出的说法：只能作为成员）

实际 C++ 标准比这里略宽松一些，但按本课程的要求记忆上述即可。

---

## 10.5 重载双目运算符：字符串比较示例

这里以一个自定义字符串类 `String` 为例，重载比较运算符 `>  <  ==`。

### 10.5.1 先定义基本类

```cpp
#include <iostream>
#include <cstring>
using namespace std;

class String {
public:
    explicit String(char* str) : p(str) {}

    void display() const {
        cout << p << endl;
    }

    // 友元比较运算符
    friend bool operator>(const String& s1, const String& s2);
    friend bool operator<(const String& s1, const String& s2);
    friend bool operator==(const String& s1, const String& s2);

private:
    char* p;      // 指向 C 风格字符串
};
```

### 10.5.2 实现 `>` 运算符

```cpp
bool operator>(const String& s1, const String& s2)
{
    return std::strcmp(s1.p, s2.p) > 0;
}
```

使用示例：

```cpp
int main()
{
    String s1("Hello");
    String s2("Book");

    cout << (s1 > s2) << endl;   // 输出 1（true）
}
```

### 10.5.3 实现 `<` 与 `==`

```cpp
bool operator<(const String& s1, const String& s2)
{
    return std::strcmp(s1.p, s2.p) < 0;
}

bool operator==(const String& s1, const String& s2)
{
    return std::strcmp(s1.p, s2.p) == 0;
}
```

测试程序可以写一个 `compare` 函数，使用这些重载运算符：

```cpp
void compare(const String& s1, const String& s2)
{
    if (s1 > s2) {
        s1.display(); cout << " > "; s2.display();
    } else if (s1 < s2) {
        s1.display(); cout << " < "; s2.display();
    } else if (s1 == s2) {
        s1.display(); cout << " = "; s2.display();
    }
}

int main()
{
    String s1("Hello"), s2("Book"), s3("Computer"), s4("Hello");
    compare(s1, s2);
    compare(s2, s3);
    compare(s1, s4);
}
```

> 这个例子强调：**双目运算符的重载本质上就是写一个“比较函数”，只是通过运算符语法糖调用**。

---

## 10.6 重载单目运算符：自增 `++` 示例

以 `Time` 类为例，模拟一个“分钟 + 秒”的简单计时器，每次 `++` 走一秒，满 60 秒进 1 分钟。

### 10.6.1 仅重载前置 `++`

```cpp
class Time {
public:
    Time(int m = 0, int s = 0) : minute(m), sec(s) {}

    // 前置 ++
    Time operator++();       // 前置形式：++t

    void display() const {
        cout << minute << ":" << sec << endl;
    }

private:
    int minute;
    int sec;
};

Time Time::operator++()
{
    if (++sec == 60) {
        sec -= 60;
        ++minute;
    }
    return *this;           // 返回“自增后的当前对象”
}
```

使用示例（略去 `Sleep` 等特定平台函数）：

```cpp
int main()
{
    Time t(34, 0);
    for (int i = 0; i < 3; ++i) {
        ++t;          // 调用前置 ++
        t.display();
    }
}
```

---

### 10.6.2 区分前置与后置 `++`

C++ 约定：

* **前置自增**：函数原型

  ```cpp
  Time& operator++();          // 无参数
  ```

* **后置自增**：函数原型

  ```cpp
  Time operator++(int);        // 有一个哑元 int 形参
  ```

其中这个 `int` 参数**并不参与运算，仅用来区分前置 / 后置**。

改写 `Time` 类：

```cpp
class Time {
public:
    Time(int m = 0, int s = 0) : minute(m), sec(s) {}

    Time& operator++();    // 前置 ++
    Time  operator++(int); // 后置 ++

    void display() const {
        cout << minute << ":" << sec << endl;
    }

private:
    int minute;
    int sec;
};

// 前置：返回“自增后的自身”
Time& Time::operator++()
{
    if (++sec >= 60) {
        sec -= 60;
        ++minute;
    }
    return *this;
}

// 后置：返回“自增前的旧值”
Time Time::operator++(int)
{
    Time old = *this;   // 先保存旧值
    if (++sec >= 60) {
        sec -= 60;
        ++minute;
    }
    return old;
}
```

对比使用：

```cpp
int main()
{
    Time t1(34, 59), t2;

    ++t1;                 // 前置，自增完再用
    cout << "++t1: ";
    t1.display();         // 35:0

    t2 = t1++;            // 后置：先把旧值赋给 t2，再自增 t1
    cout << "t1++: ";
    t1.display();         // 35:1
    cout << "t2: ";
    t2.display();         // 35:0
}
```

> 结论：
>
> * 前置 `++` 一般返回 **引用**，效率高，可参与连续运算；
> * 后置 `++` 通常返回 **值**，保留自增前的状态。

---

## 10.7 流插入 `<<` 与流提取 `>>` 的重载

### 10.7.1 为何需要重载

* 标准库中：`cout` 是 `ostream` 类对象，`cin` 是 `istream` 类对象。
* 头文件里已经给内置类型（`int`、`double`、`char*` 等）重载了 `<<` 与 `>>`。
* 若希望 `cout << 对象`、`cin >> 对象` 能直接处理自定义类型，就必须**为该类型重载 `<<` 和 `>>`**。

### 10.7.2 规范的函数原型

* 流提取（输入）运算符：

  ```cpp
  istream& operator>>(istream& is, 自定义类& x);
  ```

* 流插入（输出）运算符：

  ```cpp
  ostream& operator<<(ostream& os, const 自定义类& x);
  ```

其中：

* **函数类型和第一个参数类型相同**（都是 `istream&` 或 `ostream&`），
* 这样函数体末尾可以 `return is;` 或 `return os;`，支持 `cin >> a >> b;` 这种连续使用。

> 由于左操作数必须是 `cin` / `cout` 这样的**流对象**，而它们不是用户的类，因此 **`>>` 和 `<<` 必须写成非成员函数**。如果要访问类的私有成员，则应声明为友元。

---

### 10.7.3 重载 `<<`：输出复数

```cpp
#include <iostream>
using namespace std;

class Complex {
public:
    Complex(double r = 0.0, double i = 0.0)
        : real(r), imag(i) {}

    friend ostream& operator<<(ostream& os, const Complex& c);

private:
    double real;
    double imag;
};

ostream& operator<<(ostream& os, const Complex& c)
{
    os << "(" << c.real << " + " << c.imag << "i)";
    return os;
}

int main()
{
    Complex c1(2, 4), c2(6, 10), c3;
    // 假设已有 operator+ 实现
    c3 = c1 + c2;
    cout << "c3 = " << c3 << endl;
}
```

`cout << c3;` 会被解释为：

```cpp
operator<<(cout, c3);
```

函数内部通过引用参数 `os` 对应 `cout`，返回 `os` 以支持链式输出。

---

### 10.7.4 重载 `>>`：输入复数

```cpp
class Complex {
public:
    friend ostream& operator<<(ostream& os, const Complex& c);
    friend istream& operator>>(istream& is, Complex& c);

private:
    double real;
    double imag;
};

istream& operator>>(istream& is, Complex& c)
{
    cout << "input real and imaginary part of complex num: ";
    is >> c.real >> c.imag;
    return is;
}
```

使用示例：

```cpp
int main()
{
    Complex c1, c2;
    cin >> c1 >> c2;           // 连续提取
    cout << "c1 = " << c1 << endl;
    cout << "c2 = " << c2 << endl;
}
```

---

## 10.8 不同类型数据间的转换

这一节主要讨论“自定义类型与内置类型”之间的自动 / 显式转换，包括：

1. **转换构造函数**：其他类型 → 本类；
2. **类型转换函数**：本类 → 其他类型；
3. 两者与运算符重载共同作用时的细节与二义性。

---

### 10.8.1 转换构造函数（conversion constructor）

#### 1. 定义与形式

* 转换构造函数是 **只有一个参数且类型不是本类本身** 的构造函数，其作用是“把该参数的类型转换为本类对象”。

例如，在 `Complex` 中：

```cpp
class Complex {
public:
    Complex(double r = 0.0, double i = 0.0)
        : real(r), imag(i) {}

    // 转换构造函数：double -> Complex
    Complex(double r) {
        real = r;
        imag = 0.0;
    }

private:
    double real;
    double imag;
};
```

这里 `Complex(double r)` 就是一个转换构造函数：将 `double` 解释为“实部为 r、虚部为 0 的复数”。

#### 2. 调用方式

1. **直接初始化对象**

   ```cpp
   Complex c(3.6);     // 3.6 -> Complex(3.6, 0)
   ```

2. **显式类型转换**

   ```cpp
   Complex c = Complex(3.6);   // 与上一句效果相同，只生成一个对象
   ```

3. **隐式转换（赋值 / 参数传递等）**

   ```cpp
   Complex c1 = 9.9;      // 等价于 Complex c1(9.9);
   Complex c2;
   c2 = 9.9;              // 先构造一个临时 Complex(9.9)，再赋值给 c2
   ```

   第二种写法中，**会生成一个临时对象，再调用赋值运算符**，因此从对象个数上看是“两步”。

---

### 10.8.2 转换构造函数与重载 `+` 的配合

考虑如下表达式：

```cpp
Complex c1(3, 4);
Complex c = c1 + 2.5;
```

如果我们把 `+` 写成友元函数：

```cpp
class Complex {
    // ...
    friend Complex operator+(const Complex& c1, const Complex& c2);
};

Complex operator+(const Complex& c1, const Complex& c2)
{
    return Complex(c1.real + c2.real, c1.imag + c2.imag);
}
```

那么 `c1 + 2.5` 的流程是：

1. `2.5` 通过 **转换构造函数** 自动变为临时对象 `Complex(2.5, 0)`；
2. 调用 `operator+(c1, 临时复数)`。

注意：如果参数类型是 `Complex&` 而不是 `const Complex&`，那么临时对象是 **不能绑定到非常量引用** 的，会导致编译错误。因此应让重载函数的形参为 `const Complex&`。

---

### 10.8.3 类型转换函数（type-cast operator）

类型转换函数把“当前类对象”转换为“其他类型的数据”。

一般形式：

```cpp
operator 目标类型()
{
    // 返回一个目标类型的值
}
```

特点：

* 函数名为 `operator 类型名`，**没有返回类型说明**（实际返回类型就是 `类型名`）。
* **没有参数**。
* **只能作为成员函数**，不能是友元或普通函数。

在 `Complex` 中定义一个转换到 `double` 的函数：

```cpp
class Complex {
public:
    Complex(double r = 0.0, double i = 0.0)
        : real(r), imag(i) {}

    operator double() const {   // 转为 double，取实部
        return real;
    }

private:
    double real;
    double imag;
};
```

现在：

```cpp
int main()
{
    Complex c1(3, 4);
    double d = 2.5 + c1;   // c1 自动转换为 double（其实部 3）
    cout << d << endl;     // 输出 5.5
}
```

* 表达式 `2.5 + c1` 时，由于标准算术运算更偏好内置类型，编译器会把 `c1` 转换为 `double`，再做普通的 `double + double`。

---

### 10.8.4 结合重载 `+` 的示例与二义性问题

设有以下定义：

```cpp
class Complex {
public:
    Complex(double r = 0.0, double i = 0.0)
        : real(r), imag(i) {}

    Complex(double r) { real = r; imag = 0.0; }  // 转换构造函数

    operator double() const { return real; }      // 类型转换函数

    friend Complex operator+(Complex c1, Complex c2);

private:
    double real;
    double imag;
};

Complex operator+(Complex c1, Complex c2)
{
    return Complex(c1.real + c2.real,
                   c1.imag + c2.imag);
}
```

考虑：

```cpp
Complex c1(3, 4), c3;
c3 = c1 + 2.5;
```

这里有两种可能的转换路径：

1. 使用 **转换构造函数**：`2.5` → `Complex(2.5, 0)`，再执行 `Complex + Complex`；
2. 使用 **类型转换函数**：`c1` → `double`，再执行 `double + double`，结果再转回 `Complex`（如果还有对应构造函数或其他规则）。

编译器发现有多个“同样可行”的转换路径时，就会报“二义性”错误。

**因此：**

* 一般不要同时为同一对类型（如 `Complex` 和 `double`）提供“互相转换”的两套机制，或至少要谨慎设计。
* 本章最后的结论是：在已经有合适的转换构造函数的情况下，把 `+` 写成友元函数，就可以很好地支持 **交换律**：

  ```cpp
  Complex c1(3, 4), c3, c4;
  c3 = c1 + 2.5;   // double -> Complex
  c4 = 2.5 + c1;   // double -> Complex，同样可行
  ```

  因为两个操作数都会“倾向”向 `Complex` 转换，从而都调用 `operator+(Complex, Complex)`。

---

## 10.9 本章要点总结

1. **运算符重载是通过普通函数语法 + `operator 符号` 实现的，本质就是函数调用。**
2. **不能改变运算符的“语法属性”（操作数个数、优先级、结合性），只能改变“具体运算规则”。**
3. 成员形式：左操作数必须是类对象，参数个数可少一个；友元形式：更灵活，尤其是要支持 `int + Complex` 这类场景时几乎必用。
4. 双目运算符（如 `+ - * /`、比较运算符）可以设计为成员或友元，但：

   * 流插入 `<<` / 流提取 `>>` 通常写成友元非成员函数；
   * 赋值、下标、函数调用等则按课程要求写成成员函数。
5. 前置和后置自增（自减）通过是否带 `int` 假参数区分，语义不同：前置返回修改后的对象，后置返回修改前的对象。
6. 流运算符重载的原型固定形如 `ostream& operator<<(ostream&, const T&)` 和 `istream& operator>>(istream&, T&)`，第一参数与返回类型都是流引用，以支持链式输入输出。
7. 转换构造函数负责“其他类型 → 本类”；类型转换函数 `operator type()` 负责“本类 → 其他类型”，二者配合运算符重载可以实现丰富的隐式转换，但要警惕**二义性**。
