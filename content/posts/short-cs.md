---
title: "Short Coding - C# Version"
slug: "short-cs"
date: "2021-09-14"
excerpt: "백준 숏코딩에 빠진 필자가 들고 온 것은 바로 C# 숏코딩이다. 사실 C# 숏코딩을 해도 C같은 다른 언어(특히 GolfScript)에 못 미치는건 사실이다. 다만, C# 숏코딩은 타 언어에 비해서 경쟁력이 낮아 C# 카테고리에서 1등을 차지하기 쉬울것이다. 그럼 바이"
tags:
  - "acmicpc"
  - "B"
  - "Baekjoon"
  - "C#"
  - "short coding"
  - "숏코딩"
---

<p>백준 숏코딩에 빠진 필자가 들고 온 것은 바로 C# 숏코딩이다.</p>
<p><br></p>
<p>사실 C# 숏코딩을 해도 C같은 다른 언어(특히 GolfScript)에 못 미치는건 사실이다.</p>
<p>다만, C# 숏코딩은 타 언어에 비해서 경쟁력이 낮아 C# 카테고리에서 1등을 차지하기 쉬울것이다.</p>
<p><br></p>
<p>그럼 바이트 수를 줄이는 방법을 연구해보자</p>
<p><br></p>
<p>가장 쉬운 문제인 A+B를 이용해서 구해보자.</p>
<p><br></p>
<p><b>1. 변수명은 최대한 짧게!</b></p>
<p><br></p>

```text
using System;

var inp = Console.ReadLine().Split(' ');

int x1 = int.Parse(inp[0]);
int x2 = int.Parse(inp[1]);

Console.WriteLine(x1 + x2);
// 141 B
```

<p><br></p>
<p>위에 작성한 코드의 변수명은(<s>사실 조금 과장한 감이 없잖아 있다만</s>) 꽤나 길다. 저러한 변수들은 모두 1글자로 줄일 수 있다. 또한 x1과 x2가 같은 형식이므로 int를 생략할 수 있다</p>

```text
using System;

var i = Console.ReadLine().Split(' ');

int a = int.Parse(i[0]),
    b = int.Parse(i[1]);

Console.WriteLine(a+b);
// 129 B
```

<p><b>2. 기본 라이브러리 함수를 최대한 활용해보자!</b></p>
<p><br></p>
<p>위 코드의 문제점은 a와 b를 새로 할당해서 변환하는 작업을 거친다는 것이다. 이를 간략하게 줄여줄 메서드가 있는데, 바로 Array.ConvertAll이라는 함수이다. 내용에 대해서는 아래 링크를 참조하자.</p>
<p><br></p>
<figure>(TInput[], Converter<TInput,TOutput>) 메서드 (System)" data-og-description="한 형식의 배열을 다른 형식의 배열로 변환합니다.Converts an array of one type to an array of another type." data-og-host="docs.microsoft.com" data-og-source-url="https://docs.microsoft.com/ko-kr/dotnet/api/system.array.convertall?view=net-5.0" data-og-url="https://docs.microsoft.com/ko-kr/dotnet/api/system.array.convertall" data-og-image="https://blog.kakaocdn.net/dna/bFUMRM/hyLBBfcTuS/AAAAAAAAAAAAAAAAAAAAAAkRfMrqq7G845iosKxFI0gUtvSadOoQ1S_uxLuYAFGe/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1774969199&allow_ip=&allow_referer=&signature=p92%2FWnKZnnKwwfMjEkauEnkMRjk%3D"><a>
<div> </div>
<div>
<p>Array.ConvertAll<tinput,toutput>(TInput[], Converter<tinput,toutput>) 메서드 (System)</tinput,toutput></tinput,toutput></p>
<p>한 형식의 배열을 다른 형식의 배열로 변환합니다.Converts an array of one type to an array of another type.</p>
<p>docs.microsoft.com</p>
</div>
</a></figure>
<p><br></p>
<p>함수를 이용해 a와 b를 사용하지 않고 배열만을 이용해보자. 또한 WriteLine이 아닌 Write함수로 대체할 수 있다.</p>

```text
using System;

var i = Array.ConvertAll(Console.ReadLine().Split(' '), int.Parse);

Console.Write(i[0]+i[1]);
// 109 B
```

<p>자 점점 코드가 줄어드는게 눈에 보일 것이다.</p>
<p><br></p>
<p><b>3. 필요 없는 공백,  줄바꿈을 다 지우보자</b></p>
<p><br></p>
<p>숏코딩은 가독성 따위는 개나줘버린다. 가령 꼭 공백이 필요한 경우가 아니라면 싹 지워버리자. 줄바꿈 또한 전혀 필요하지 않다.</p>

```text
using System;var i=Array.ConvertAll(Console.ReadLine().Split(' '),int.Parse);Console.Write(i[0]+i[1]);
// 102 B
```

<p>이렇게 해서 처음 141B에서 102B로 무려 39B나 줄였다.</p>
<p><br></p>
<p><b>x. 알고리즘 이용하기</b></p>
<p><br></p>
<p>여기서 조금 더 나아가면, 알고리즘을 이용하면 조금 더 짧은 코드가 나온다.</p>
<p>백준 문제 1000번에는 "(0 < A, B < 10)" 이러한 조건이 있다. 이를 이용해서 아스키 코드의 특성을 이용한 알고리즘을 쓸 수 있는데 코드는 다음과 같다.</p>

```text
using static System.Console;Write(Read()-3*Read()+Read());
// 58 B
```

<p>무려 58B까지 줄어들었다. 멀쩡한 코드같아 보이지는 않는다. 과연 무슨 원리일까?</p>
<p><br></p>
<p>Read() 함수는 한 글자를 읽어서 ascii 코드값을 반환한다. A와 B가 0과 10사이의 수임으로 한 글자만 받아도 어떠한 경우에서든지 성립이 가능하다.</p>
<p><br></p>
<p>Read()를 총 3번 읽는다 이를 나눠보면.</p>
<p>Read 1 : A값을 얻는다.</p>
<p>Read 2 : 공백을 얻는다. (ASCII : 32)</p>
<p>Read 3 : B값을 얻는다.</p>
<p><br></p>
<p>여기서 한가지 알고넘어갈 점은 ASCII에서 '0'과 '0'을 더한 값은 공백인 32를 3번 곱한 값이랑 일치한다. 따라서 A와 B의 아스키를 더한 후 공백의 아스키를 3번 곱한 값을 빼주면 int로 변환하는 과정 없이 바로 숫자를 뽑아 낼 수 있다.</p>
<p><br></p>
<p><b>y. for문 트릭</b></p>
<p><br></p>
<p>for문은 특이한 성질을 가지고 있다. C에서 숏코딩을 해봤다면 알법한 내용이다. 혹시나 궁금하다면 아래 주소로 들어가서 내용을 봐보자</p>
<figure><a>
<div> </div>
<div>
<p>for에 관한 고찰</p>
<p>C#에서 자주 보이는 구문이 하나 있다. 바로 "for". ​ for은 반복을 해주는 반복문으로써 꽤 자주 쓰이게 되는데, 최근에 발견한 for에 관한 이야기이다. ​ 우리가 잘 알고 있듯이 for문은 다음과 같</p>
<p>thinkcs.tistory.com</p>
</div>
</a></figure>
<p>위 내용처럼, for문 트릭을 이용함으로써 선언자 생략, 조건문 변형등이 가능하다.</p>
<hr>
<p>숏코딩 재밌어 보이지 않는가? A+B 다음으로 쉬운 A-B를 스스로 도전해보길 바란다.</p>
<p><br></p>
<p>참고로 필자의 A-B 기록은 58B이다. 위와 같은 방법을 응용해서 코드를 줄여보길 바란다. </p>
