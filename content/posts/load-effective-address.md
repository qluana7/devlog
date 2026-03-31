---
title: "Load Effective Address"
slug: "load-effective-address"
date: "2024-11-14"
excerpt: "어셈블리 기본 Instruction중 하나인 LEA(Load Effective Address)에 대해 알아보자. Effective Address가 무엇인가? 예전에 어셈블리와 기계어에 대한 포스트 에서 언급한 바 있는 SIB란 녀석이 있었다. Base + Scale *"
tags:
  - "assembly"
  - "Displacement"
  - "effective address"
  - "lea"
  - "load effective address"
  - "sib"
  - "유효 주소"
---

<p>어셈블리 기본 Instruction중 하나인 LEA(Load Effective Address)에 대해 알아보자.<br><br>Effective Address가 무엇인가?<br><br>예전에 <a>어셈블리와 기계어에 대한 포스트</a>에서 언급한 바 있는 SIB란 녀석이 있었다.</p>
<p><br></p>
<p>Base + Scale * Index로 계산되는데, 여기에 Displacement까지 더해서 나온 주솟값.</p>
<p>이 주솟값을 <b>Effective Address</b>, 한국어론 <b>유효 주소</b>라고 부른다.</p>
<p><br></p>
<p>그렇다면 어셈블리에서 LEA는 주로 어디에 사용되는가?</p>
<p><br></p>
<p>가장 간단한 예시로는 특정 레지스터의 주소를 기반으로 다른 주소를 구할 때 사용할 수 있을 것이다.</p>
<p><br></p>
<p>예를 들어, 가장 간단한 함수에서 사용하는 변수에 접근한다고 생각해보자.</p>
<p>그럼 다음과 같은 코드를 작성할 수 있을 것이다.</p>

```asm
...
    ; int i : [ebp-4]
    
    ; eax = i;
    mov eax, [ebp-4]
    
    ; i = 3;
    mov eax, 3
    mov [ebp-4], eax
...
```

<p><br></p>
<p>그렇다면 변수의 주소를 얻어와야 한다면?</p>
<p><br></p>
<p>특정 레지스터에 ebp 주소를 넣고 sub 4를 할 수도 있을 것이다.</p>
<p><br></p>
<p>그러나 어셈블리에선 LEA 명령어를 통해서 더 간소화된 방식을 지원하는 것이다.</p>

```asm
...
    ; int i : [ebp-4]
    
    ; eax = &i; no lea
    mov eax, ebp
    sub eax, 4
    
    ; eax = &i; use lea
    lea eax, [ebp-4]
...
```

<p><br></p>
<p>이 외에도 SIB에서 Scale과 Index를 사용하여 배열 인덱싱에도 적용할 수 있을 것이다.</p>
<p>(직접 코드를 작성해보기를 바란다.)</p>
<p><br></p>
<p>필자가 이 글을 쓰는데에는 추가적인 이유가 있다.</p>
<p><br></p>
<p>이러한 유효한 주소를 가져오는데에만 사용될 것만 같은 이 Instruction은 의외의 기능으로도 사용되고 있다.</p>
<p><br></p>
<p>다음 C언어 코드를 보자.</p>

```cpp
r = a + 4;
```

<p><br></p>
<p>어셈블리에서는 다음과 같이 표현될 것이다.</p>

```asm
...
    ; int r : [ebp-4], int a : [ebp-8]
    ; r = a + 4
    mov eax, [ebp-8]
    add eax, 4
    mov [ebp-4], eax
...
```

<p><br></p>
<p>이 코드에서 add 대신 재미난 방법을 사용해 이를 처리할 수 있다.</p>
<p><br></p>
<p>LEA는 해당 주소가 실제 접근할 수 없는 주소라도 연산을 해준다(!!)</p>
<p><br></p>
<p>즉, 위에 코드가 다음과 같이 될 수도 있다는 이야기이다.</p>

```asm
...
    ; int r : [ebp-4], int a : [ebp-8]
    ; r = a + 4
    mov eax, [ebp-8]
    lea eax, [eax+4]
    mov [ebp-4], eax
...
```

<p><br></p>
<p><i>"엥? 별 차이 없는거 아니에요? 그냥 add하면 되지 왜 lea를 써요?"</i></p>
<p><br></p>
<p>맞는 이야기이다만, 이번에는 다른 예제를 살펴보자.</p>
<p><br></p>

```cpp
r = a * 4 + 3;
```

<p><br></p>
<p>이번에는 식이 조금 더 복잡해졌다. 어셈블리 코드를 보자.</p>

```asm
...
    ; int r : [ebp-4], int a : [ebp-8]
    ; r = a * 4 + 3
    mov eax, [ebp-8]
    ; mul 최적화. 나중에 포스팅을 통해 따로 다룰 예정.
    shl eax, 2
    add eax, 3
    mov [ebp-4], eax
...
```

<p><br></p>
<p>그럼 이 코드를 LEA를 사용해서 만들어 볼 수 있을까?</p>
<p><br></p>

```asm
...
    ; int r : [ebp-4], int a : [ebp-8]
    ; r = a * 4 + 3
    mov eax, [ebp-8]
    lea eax, [eax*4+3]
    mov [ebp-4], eax
...
```

<p><br></p>
<p>훨씬 간단한 코드가 만들어졌다.</p>
<p>(SIB의 특성상, Scale에는 1, 2, 4, 8 (3, 5, 9) 만 사용될 수 있음에 주의.)</p>
<p><br></p>
<p>이 뿐만 아니라, SIB의 특성상 상수를 제외하고도 레지스터가 추가적으로 들어갈 수 있어, 더 많은 단축이 가능한 셈이다.</p>
<p><br></p>
<p>LEA를 사용하는데 있어 좋은 점은 이뿐만이 아니다.</p>
<p><br></p>
<p>lea를 사용하게 되면, 연산을 하면서 생기는 레지스터 소모가 사라진다는 것이다.</p>
<p><br></p>
<p>즉, 특정 레지스터의 값을 바꾸지 않으면서 연산을 진행하여 결과를 도출해낼 수 있다는 의미이다.</p>
<p><br></p>
<p>이러한 LEA의 사용은 많은 상황에서 쓰일 수 있는 것은 아니지만, 간간히 특정 식에 대해 최적화를 진행할 수 있을 것이다.</p>
<p><br></p>
