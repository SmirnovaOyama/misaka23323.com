> 此文章为网站 https://hrt.misaka23323.com 底层医学模型的具体解释<br>
> 更新时间：2025 年 12 月 5 日<br>
>  paste 备份：https://paste.sheartm.com/aaaaaace
## 目录

1. [总体概览](#总体概览)
2. [变量与单位约定](#变量与单位约定)
3. [酯类到雌二醇的换算](#酯类到雌二醇的换算)
4. [生物利用度与给药途径](#生物利用度与给药途径)

   1. [通用生物利用度函数](#通用生物利用度函数)
   2. [各途径的 $F$ 设定](#各途径的-f-设定)
5. [核心 PK 参数](#核心-pk-参数)
6. [单事件（DoseEvent）的数学模型](#单事件doseevent的数学模型)

   1. [一室一阶吸收–一阶消除模型](#一室一阶吸收一阶消除模型)
   2. [三室序列模型（解析解）](#三室序列模型解析解)
   3. [双分支结构：快/慢库或舌下/吞咽](#双分支结构快慢库或舌下吞咽)
7. [各给药途径的具体形式](#各给药途径的具体形式)

   1. [肌肉注射（injection）](#肌肉注射injection)
   2. [口服（oral）](#口服oral)
   3. [舌下（sublingual）](#舌下sublingual)
   4. [凝胶（gel）](#凝胶gel)
   5. [贴片（patchApply / patchRemove）](#贴片patchapply--patchremove)
8. [整体模拟过程 `runSimulation`](#整体模拟过程-runsimulation)

   1. [时间网格与事件叠加](#时间网格与事件叠加)
   2. [量–浓度换算与 AUC](#量浓度换算与-auc)
9. [浓度插值 `interpolateConcentration`](#浓度插值-interpolateconcentration)

---

## 1. 总体概览

本模型实现了一个**多给药途径、多酯类雌激素**的 PK 模拟框架，通过给定一组给药事件 `DoseEvent[]` 和体重，计算在一段时间内的：

* 时间序列：$t_i$（单位：小时）
* 血浆雌二醇浓度：$C_i$（单位：pg/mL）
* 总暴露量（AUC）：$\mathrm{AUC}$（单位：pg·h/mL）

核心思路：

:::info[核心思路]{open}
1. 每个给药事件被映射为一个连续函数

   $$A_j(t) = \text{事件 } j \text{ 在时间 } t \text{ 时体内雌二醇“量”（mg）}$$

2. 总量为所有事件的线性叠加：

   $$A_{\text{total}}(t) = \sum_j A_j(t)$$

3. 再根据体重和分布容积换算成浓度 $C(t)$，并用数值积分近似 AUC。
:::

---

## 2. 变量与单位约定

* 时间 $t$：

  * 对应 `timeH`，单位为小时（相对值有意义，绝对基准为 1970 起的小时数）。
* 剂量 `doseMG`：

  * 单位：mg
  * 含义：对模型内部来说，是**以该事件所用药物（酯或 E2 本身）的 mg 数量**传入，再通过 $F$ 或分子量换算成有效的 E2 量。
* 体重 `bodyWeightKG`：

  * 单位：kg。
* 浓度 `concPGmL`：

  * 单位：pg/mL。
* AUC：

  * 单位：pg·h/mL（梯形法数值积分）。

---

## 3. 酯类到雌二醇的换算

模型支持的酯类：

* $E2$：雌二醇本体
* $EB$：Estradiol Benzoate
* $EV$：Estradiol Valerate
* $EC$：Estradiol Cypionate
* $EN$：Estradiol Enanthate

分子量：

* $MW_{\mathrm{E2}} = 272.38$
* $MW_{\mathrm{EB}} = 376.50$
* $MW_{\mathrm{EV}} = 356.50$
* $MW_{\mathrm{EC}} = 396.58$
* $MW_{\mathrm{EN}} = 384.56$

换算函数：

$$
\text{toE2Factor}(\text{ester}) =
\begin{cases}
1, & \text{ester} = \mathrm{E2} \\[6pt]
\dfrac{MW_{\mathrm{E2}}}{MW_{\text{ester}}}, & \text{其他酯类}
\end{cases}
$$


:::warning[重要]{open}
当需要从“酯的 mg”折算到“理论 E2 mg 当量”时，必须乘以该因子。这是因为酯类药物中包含酯基的重量，而我们关注的是水解后的雌二醇重量。
:::

---

## 4. 生物利用度与给药途径

### 4.1 通用生物利用度函数

`getBioavailabilityMultiplier(route, ester, extras)` 提供了一个较高层的**生物利用度系数** $F_\text{route}$，主要供 UI 和计算“有效剂量”等用途。

不同给药途径下的返回值如下。

### 4.2 各途径的 $F$ 设定

1. **肌肉注射 injection**

   形成比例 $f_{\text{form}}$ 来自 `InjectionPK.formationFraction[ester]`，再乘以酯到 E2 的分子量换算：

   $$
   F_{\text{inj}}(\text{ester})
   = f_{\text{form}}(\text{ester}) \cdot \text{toE2Factor}(\text{ester})
   $$

2. **口服 oral**

   固定生物利用度（首过效应之后）：

   $$
   F_{\text{oral}} = 0.03
   $$

3. **舌下 sublingual**

   舌下途径被分成两部分：

   * 比例 $\theta$：舌下直接吸收，不经过首过，$F = 1$；
   * 比例 $1 - \theta$：被咽下，当作口服，$F = 0.03$。

   综合生物利用度为：

   $$
   F_{\text{SL}}
   = \theta + (1 - \theta) \cdot 0.03
   $$

   其中 $\theta$ 可由：

   * `extras.sublingualTheta` 自定义，$0 \le \theta \le 1$；
   * 或通过 `sublingualTier`（quick/casual/standard/strict）映射到不同的 $\theta$。

4. **凝胶 gel**

   简化设定为固定 $5%$：

   $$
   F_{\text{gel}} = 0.05
   $$

5. **贴片 patchApply**

   生物利用度设为 1，给药过程由释放速率决定：

   $$
   F_{\text{patch}} = 1.0
   $$

6. **移除贴片 patchRemove**

   不产生新药物，仅影响贴片给药结束时间，生物利用度为 0。

---

## 5. 核心 PK 参数

全局参数：

* 分布容积系数：

  $$
  V_d = \text{vdPerKG} \times \text{bodyWeightKG}
  = 2.0 \, \mathrm{L/kg} \times \text{bodyWeightKG}
  $$

* 消除速率常数：

  * 非注射：$k_3 = k_{\text{Clear}} = 0.41 \, \mathrm{h^{-1}}$
  * 注射：$k_3 = k_{\text{ClearInjection}} = 0.041 \, \mathrm{h^{-1}}$
* 对每个事件，通过 `resolveParams(event)` 得到：

  * $F$: 该事件从 mg 给药量到“可形成 E2 mg” 的总转换系数
  * $k_1^{\text{fast}}$, $k_1^{\text{slow}}$: 两个吸收速率常数
  * $k_2$: 酯向 E2 的转化速率（注射 / 舌下 EV）
  * $k_3$: E2 的一阶消除速率
  * $\mathrm{Frac_fast}$: 快库（或舌下分支）的比例
  * $R$: 对应 `rateMGh`，零级释放速率（mg/h）

---

## 6. 单事件（DoseEvent）的数学模型

假设单个事件在时间 $t_0$ 给药，剂量为 $D$（mg）。

记 $\tau = t - t_0$ 为给药后的时间（小时），$\tau < 0$ 时 $A(\tau) = 0$。

### 6.1 一室一阶吸收–一阶消除模型

用于口服、凝胶和部分贴片情形。

设：

* 吸收速率常数：$k_a$
* 消除速率常数：$k_e = k_3$
* 生物利用度（形成 E2 的比例）：$F$
* 初始给药量：$D$（mg）

当 $k_a \ne k_e$ 时，体内 E2 量为：

$$
A(\tau)
= \frac{D F k_a}{k_a - k_e}
\left(
e^{-k_e \tau} - e^{-k_a \tau}
\right),
\quad \tau \ge 0
$$

当 $k_a \approx k_e$（数值上接近以致分母不稳定）时，采用极限形式：

$$
A(\tau)
= D F k_a \tau e^{-k_e \tau}
$$

代码中由 `oneCompAmount(tau, doseMG, params)` 实现。

---

### 6.2 三室序列模型（解析解）

用于：

* 肌肉注射（酯类）
* 舌下 EV 的快/慢分支

概念上可以理解为三步序列：

1. 给药库（depot）
2. 酯/前体库（prodrug）
3. 中央室（E2）

对应速率常数：

* $k_1$: depot $\to$ 酯库
* $k_2$: 酯库 $\to$ E2
* $k_3$: E2 $\to$ 消除

设：

* $D$：给药量（mg）
* $F$：可形成 E2 的比例（含分子量换算等）

则中央室中 E2 的解析解为：

$$
A(\tau)
= D F k_1 k_2 \left[
\frac{e^{-k_1 \tau}}{(k_1 - k_2)(k_1 - k_3)} + \frac{e^{-k_2 \tau}}{(k_2 - k_1)(k_2 - k_3)} + \frac{e^{-k_3 \tau}}{(k_3 - k_1)(k_3 - k_2)}
\right],
\quad \tau \ge 0
$$


:::warning[数值稳定性]{open}
当任意两个速率常数非常接近（数值上导致分母接近 0）时，为避免奇异点导致的计算错误，代码会直接返回 0 作为防护措施。
:::

在代码中对应 `_analytic3C(tau, doseMG, F, k1, k2, k3)`。

---

### 6.3 双分支结构：快/慢库或舌下/吞咽

对一些给药途径，模型采用**两个分支**来表示不同的吸收动力学：

* 注射：快库 + 慢库（两个不同的 $k_1$）
* 舌下：舌下支路 + 吞咽支路（两个不同的生物利用度和吸收速率）

设：

* 总剂量：$D$
* 快分支比例：$f_{\text{fast}}$
* 慢分支比例：$f_{\text{slow}} = 1 - f_{\text{fast}}$

则总量为两分支之和：

$$
A_{\text{total}}(\tau)
= A_{\text{fast}}(\tau) + A_{\text{slow}}(\tau)
$$

其中每个分支各自使用：

* 三室解析解（注射 / 舌下 EV）
* 或一室解（舌下 E2 的两部分）

---

## 7. 各给药途径的具体形式

### 7.1 肌肉注射（injection）

对注射酯类事件：

1. 从 `TwoPartDepotPK` 取得：

   * 快库比例：$f_{\text{fast}} = \mathrm{Frac_fast[\text{ester}]}$
   * 快库速率：$k_{1,\text{fast}}$
   * 慢库速率：$k_{1,\text{slow}}$

2. 从 `EsterPK.k2[ester]` 取得 $k_2$（酯 $\to$ E2 转化速率）。

3. 消除速率：

   $$
   k_3 = k_{\text{ClearInjection}} = 0.041 \, \mathrm{h^{-1}}
   $$

4. 生物利用度 $F$：

   $$
   F = f_{\text{form}}(\text{ester}) \cdot \text{toE2Factor}(\text{ester})
   $$

5. 对每个分支的剂量：

   * 快库剂量：$D_{\text{fast}} = f_{\text{fast}} D$
   * 慢库剂量：$D_{\text{slow}} = (1 - f_{\text{fast}}) D$

6. 总 E2 量为：

   $$
   A(\tau)
   = A_{\text{fast}}(\tau) + A_{\text{slow}}(\tau)
   $$

   其中每一项使用三室解析解：

   $$
   A_{\text{fast}}(\tau)
   = \text{analytic3C}\left(\tau, D_{\text{fast}}, F, k_{1,\text{fast}}, k_2, k_3\right)
   $$

   $$
   A_{\text{slow}}(\tau)
   = \text{analytic3C}\left(\tau, D_{\text{slow}}, F, k_{1,\text{slow}}, k_2, k_3\right)
   $$

---

### 7.2 口服（oral）

1. 吸收速率：

   $$
   k_a =
   \begin{cases}
   k_{\text{AbsEV}} = 0.05, & \text{ester} = EV \\[6pt]
   k_{\text{AbsE2}} = 0.32, & \text{其他情况}
   \end{cases}
   $$


2. 消除速率：

   $$
   k_e = k_3 = k_{\text{Clear}} = 0.41 \, \mathrm{h^{-1}}
   $$

3. 生物利用度：

   $$
   F = F_{\text{oral}} = 0.03
   $$

4. 使用一室模型：

   $$
   A(\tau)
   = \frac{D F k_a}{k_a - k_e}
   \left(e^{-k_e \tau} - e^{-k_a \tau}\right)
   $$

---

### 7.3 舌下（sublingual）

舌下路线分为两种情况：

#### 7.3.1 舌下 EV（ester = EV）

1. 分支比例：

   * 舌下分支（快）：$f_{\text{fast}} = \theta$
   * 吞咽分支（慢）：$f_{\text{slow}} = 1 - \theta$

2. 速率常数：

   * 舌下吸收：$k_{1,\text{fast}} = k_{\text{AbsSL}} = 1.8 \, \mathrm{h^{-1}}$
   * 吞咽吸收：$k_{1,\text{slow}} = k_{\text{AbsEV}} = 0.05 \, \mathrm{h^{-1}}$
   * 酯 $\to$ E2 转化：$k_2 = k_2(EV)$
   * 消除：$k_3 = k_{\text{Clear}} = 0.41 \, \mathrm{h^{-1}}$

3. 生物利用度：

   * 舌下分支：$F_{\text{fast}} = 1.0$
   * 吞咽分支：$F_{\text{slow}} = F_{\text{oral}} = 0.03$

4. 总量：

   $$
   A(\tau)
   = A_{\text{SL}}(\tau) + A_{\text{oral-like}}(\tau)
   $$

   其中：

   $$
   A_{\text{SL}}(\tau)
   = \text{analytic3C}\left(\tau, D \theta, F_{\text{fast}}, k_{1,\text{fast}}, k_2, k_3\right)
   $$

   $$
   A_{\text{oral-like}}(\tau)
   = \text{analytic3C}\left(\tau, D (1-\theta), F_{\text{slow}}, k_{1,\text{slow}}, k_2, k_3\right)
   $$

#### 7.3.2 舌下 E2（ester = E2）

此时不需要三室模型，只是“舌下 vs 吞咽”的双一室模型。

1. 分支比例同样为 $\theta$ / $1-\theta$。

2. 速率与生物利用度：

   * 舌下分支（不首过）：

     * 吸收：$k_{a,\text{SL}} = k_{\text{AbsSL}} = 1.8$
     * 消除：$k_e = k_3 = 0.41$
     * 生物利用度：$F_{\text{fast}} = 1.0$
   * 吞咽分支（等效口服）：

     * 吸收：$k_{a,\text{oral}} = k_{\text{AbsE2}} = 0.32$
     * 生物利用度：$F_{\text{slow}} = F_{\text{oral}} = 0.03$

3. 每个分支用一室模型：

   $$
   A_{\text{SL}}(\tau)
   = \frac{D \theta F_{\text{fast}} k_{a,\text{SL}}}{k_{a,\text{SL}} - k_e}
   \left(e^{-k_e \tau} - e^{-k_{a,\text{SL}} \tau}\right)
   $$

   $$
   A_{\text{oral-like}}(\tau)
   = \frac{D (1-\theta) F_{\text{slow}} k_{a,\text{oral}}}{k_{a,\text{oral}} - k_e}
   \left(e^{-k_e \tau} - e^{-k_{a,\text{oral}} \tau}\right)
   $$

4. 总量：

   $$
   A(\tau)
   = A_{\text{SL}}(\tau) + A_{\text{oral-like}}(\tau)
   $$

---

### 7.4 凝胶（gel）

凝胶途径简化为一室模型：

1. 吸收速率：

   $$
   k_a = 0.022 \, \mathrm{h^{-1}}
   $$

2. 生物利用度：

   $$
   F = 0.05
   $$

3. 消除速率：

   $$
   k_e = k_3 = k_{\text{Clear}} = 0.41 \, \mathrm{h^{-1}}
   $$

4. 体内 E2 量：

   $$
   A(\tau)
   = \frac{D F k_a}{k_a - k_e}
   \left(e^{-k_e \tau} - e^{-k_a \tau}\right)
   $$

---

### 7.5 贴片（patchApply / patchRemove）

:::info[两种模式]{open}
贴片模拟支持两种模式：
1. **零级释放模式**：指定了释放速率（如 50µg/day），模拟恒定释放。
2. **一阶模式（Legacy）**：未指定释放速率，使用一室模型近似。
:::

#### 7.5.1 零级释放模式（带 `releaseRateUGPerDay`）

当 `releaseRateUGPerDay` 给定时：

1. 将释放速率换算为 mg/h：

   $$
   R = \frac{\text{releaseRateUGPerDay}}{24 \times 1000}
   $$

2. 假设以恒定速率 $R$ 给药，同时按 $k_3$ 一阶消除。

3. 若在 $t_\text{remove}$ 时移除贴片，令：

   $$
   T = t_\text{remove} - t_0
   $$

4. 给药期间 $0 \le \tau \le T$：

   $$
   A(\tau)
   = \frac{R}{k_3}\left(1 - e^{-k_3 \tau}\right)
   $$

5. 停药后 $\tau > T$：

   $$
   A(\tau)
   = A(T) \cdot e^{-k_3 (\tau - T)}
   = \frac{R}{k_3}\left(1 - e^{-k_3 T}\right) e^{-k_3 (\tau - T)}
   $$

若尚未移除贴片，则视作 $T \to +\infty$，只用前一段公式。

#### 7.5.2 一阶“legacy”模式（无 `releaseRateUGPerDay`）

当没有指定释放速率时：

1. 使用一室一阶吸收模型：

   * 吸收速率：$k_a = 0.0075$
   * 生物利用度：$F = 1.0$
   * 消除：$k_3 = k_{\text{Clear}}$

2. 在贴片佩戴期间（$\tau \le T$），使用：

   $$
   A_{\text{under}}(\tau)
   = \frac{D F k_a}{k_a - k_3}
   \left(e^{-k_3 \tau} - e^{-k_a \tau}\right)
   $$

3. 贴片移除后（$\tau > T$），仅剩消除：

   $$
   A(\tau)
   = A_{\text{under}}(T) \cdot e^{-k_3 (\tau - T)}
   $$

---

## 8. 整体模拟过程 `runSimulation`

### 8.1 时间网格与事件叠加

1. 将所有 `DoseEvent` 按 `timeH` 升序排序。

2. 设首事件时间为 $t_{\min}$，末事件时间为 $t_{\max}$。

3. 定义模拟时间范围：

   $$
   t_{\text{start}} = t_{\min} - 24 \quad (\text{提前 24 小时})
   $$
   $$
   t_{\text{end}} = t_{\max} + 24 \times 14 \quad (\text{延长 14 天})
   $$

4. 用固定步数 `steps = 1000` 构建均匀网格：

   * 步长：
     $$
     \Delta t = \frac{t_{\text{end}} - t_{\text{start}}}{\text{steps} - 1}
     $$
   * 第 $i$ 个时间点：
     $$
     t_i = t_{\text{start}} + i \cdot \Delta t
     $$

5. 对每个事件构造一个 `PrecomputedEventModel`，封装函数 $A_j(t)$。

6. 在每个时间点 $t_i$，求和：

   $$
   A_{\text{total}}(t_i)
   = \sum_j A_j(t_i)
   $$

### 8.2 量–浓度换算与 AUC

1. 分布容积（以 mL 为单位）：

   $$
   V_{\text{plasma}} = V_d \times 1000
   = (2.0 \cdot \text{bodyWeightKG}) \times 1000 \quad (\text{mL})
   $$

2. 由于 $A_{\text{total}}(t)$ 单位为 mg，将其换算为 pg 再除以体积，得到浓度：

   $$
   C(t_i)
   = \frac{A_{\text{total}}(t_i) \times 10^9}{V_{\text{plasma}}}
   \quad (\text{pg/mL})
   $$

3. AUC 使用梯形法求和（在时间网格上）：

   $$
   \mathrm{AUC}
   \approx \sum_{i=1}^{N-1}
   \frac{C(t_i) + C(t_{i-1})}{2}
   \cdot (t_i - t_{i-1})
   $$

---

## 9. 浓度插值 `interpolateConcentration`

`interpolateConcentration(sim, hour)` 对任意给定时间 $t$（hour）在离散网格上做**线性插值**：

1. 若 $t \le t_0$，返回 $C(t_0)$。
2. 若 $t \ge t_{N-1}$，返回 $C(t_{N-1})$。
3. 否则，使用二分查找找到区间 $[t_k, t_{k+1}]$，再线性插值：

   $$
   C(t)
   = C(t_k) + \frac{t - t_k}{t_{k+1} - t_k}
   \left(C(t_{k+1}) - C(t_k)\right)
   $$

---

(全文完)
