---
title: "Algorithm - 재귀함수"
slug: "pr-algorithm"
date: "2021-06-15"
excerpt: "보통 우리가 어떤 언어를 배우던 대부분 재귀 함수라는 것을 많이 접해보았을 것이다. 그리고 재귀함수의 예로써 가장 많이 사용되는 것이 바로 \"피보나치 수열\"이다. 재귀함수를 가르치기 위해서 다음 같은 방법으로 재귀 함수를 표현하는데.. 이는 크나큰 문제가 있다! 1, "
tags:
  - "imported"
  - "legacy"
---

<p>보통 우리가 어떤 언어를 배우던 대부분 재귀 함수라는 것을 많이 접해보았을 것이다.</p>
<p><br></p>

```text
public static void CallAgain(int i)
{
    if (i == 1)
    { return; }
    else
    { CallAgain(i - 1); }
}
```

<p>그리고 재귀함수의 예로써 가장 많이 사용되는 것이 바로 "피보나치 수열"이다.</p>
<p>재귀함수를 가르치기 위해서 다음 같은 방법으로 재귀 함수를 표현하는데..</p>

```text
public static ulong Fibonacci( int N )
{
	if (N == 0 || N == 1)
	    return (ulong)N;
	else if (N == 2)
	    return 1;
	else
	    return Fibonacci(N - 1) + Fibonacci(N - 2);
}
```

<p>이는 크나큰 문제가 있다! 1, 9와 같은 작은 수는 빠르게 계산이 가능하지만, 49, 53, 99 등 숫자가 커지면 커질수록 계산하는데 아주 오랜시간이 걸리기 때문이다.</p>
<p><br></p>
<p>이는 함수를 호출하는 비용이 비싸기 때문인데, 이를 시간 복잡도(Big-O)로 나타내면 n에 따라서 함수 호출의 개수가 증가하므로 O(2ⁿ) 만큼의 비용이 든다. 이는 엄청난 비용을 소모함과 동시에 아주 느리게 작동하는데</p>
<p><br></p>
<p>이를 해결할 방법이 2가지가 있다. 한번 알아보자.</p>
<p><br></p>
<h4><b>1. 동적 계획법 (Dynamic Programming 이하 DP)</b></h4>
<p>첫 번째로 소개할 것은 동적 계획법, 영어로는 Dynamic Programming이라 하며 간단히 DP라고 부른다.</p>
<p>방법은 너무나도 간단하다. 메모리에 접근해서 데이터를 저장하고 불러오는 비용이 함수를 호출하는 비용보다 싸므로 배열을 이용해 피보나치를 구하는 방법이다.</p>

```text
public static ulong DPFibonacci( int N ) 
{
    int    i;
    ulong  Result;
    ulong[] FibonacciTable;

    if ( N==0 || N==1 )
        return (ulong)N;

    FibonacciTable = new ulong[N + 1];

    FibonacciTable[0] = 0;
    FibonacciTable[1] = 1;

    for ( i=2; i<=N; i++ )
    {        
        FibonacciTable[i] = FibonacciTable[i-1] + FibonacciTable[i-2];
    }
    
    Result = FibonacciTable[N];

    return Result;
}
```

<p>이 경우에는 시간 복잡도로 나타내면 n번 반복할 때마다 n번씩 증가하므로 O(n) 만큼의 비용이 든다. 아까 재귀함수보단 훨씬 효율적인 방법인 것이다.</p>
<p><br></p>
<h4><b>2. 분할 정복 (Divide and Conquer 이하 DnC)</b></h4>
<p>두 번째로 소개할 것은 분할 정복, 영어로는 Divide and Conquer이라 하며 DnC라고도 부른다.</p>
<p>여기서는 2x2 행렬을 이용해서 피보나치를 구하는 방법을 소개하고 있다.</p>

```text
public class Matrix_2x2
{
    public Matrix_2x2()
    {
        Data = new ulong[2, 2];
    }

    public ulong[,] Data;

    public static Matrix_2x2 operator * (Matrix_2x2 A, Matrix_2x2 B)
    {
        Matrix_2x2 C = new Matrix_2x2();

        C.Data[0, 0] = A.Data[0, 0] * B.Data[0, 0] + A.Data[0, 1] * B.Data[1, 0];
        C.Data[0, 1] = A.Data[0, 0] * B.Data[1, 0] + A.Data[0, 1] * B.Data[1, 1];

        C.Data[1, 0] = A.Data[1, 0] * B.Data[0, 0] + A.Data[1, 1] * B.Data[1, 0];
        C.Data[1, 1] = A.Data[1, 0] * B.Data[1, 0] + A.Data[1, 1] * B.Data[1, 1];

        return C;
    }

    public static Matrix_2x2 operator ^(Matrix_2x2 A, int n)
    {
        if (n > 1)
        {
            A ^= n / 2;
            A *= A;

            if (Convert.ToBoolean(n & 1))
            {
                Matrix_2x2 B = new Matrix_2x2();
                B.Data[0, 0] = 1; B.Data[0, 1] = 1;
                B.Data[1, 0] = 1; B.Data[1, 1] = 0;

                A *= B;
            }
        }

        return A;
    }
}

public static ulong DnCFibonacci(int N)
{
    Matrix_2x2 A = new Matrix_2x2();
    A.Data[0, 0] = 1; A.Data[0, 1] = 1;
    A.Data[1, 0] = 1; A.Data[1, 1] = 0;

    A ^= N;

    return A.Data[0, 1];
}
```

<p>이 경우에는 시간 복잡도로 나타내면 n번 반복할 때 마다 O(log₂ n) 만큼 비용이 든다. 동적 할당법 보다는 분할 정복이 더 빠른 성능을 기록한다. </p>
<p><br></p>
<p>아래는 실제 코드를 돌려서 구한 시간으로 피보나치 수열 49번째를 구하는데 걸린 시간은 재귀함수가 무려 1분을 넘겼고 다른 알고리즘은 1초 조차 안 넘긴 모습이다.</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/6c28bdf73d53268cc9245602d4df0162.png)

</p>
<p>이에 대한 내용들은 인터넷에도 많이 널려 있으니 검색해서 찾아보길 바란다.</p>
