---
title: "Creating Dependent Files in Visual Studio"
slug: "vs-file-dependent"
date: "2021-06-09"
excerpt: "비주얼 스튜디오 팁 가끔 그럴때가 있다. 내가 만든 cs파일 (예를 들어 Form.Init)을 Form.Designer.cs 처럼 특정 폼에 종속시켜버리고 싶은 경우가 있다. 아래의 사진과 같이 말이다 ![](https://blog.kakaocdn.net/dna/3np"
tags:
  - "csproj"
  - "dependentupon"
  - "from"
  - "visualstuido"
  - "비주얼스튜디오"
---

<p>비주얼 스튜디오 팁</p>
<p>가끔 그럴때가 있다. 내가 만든 cs파일 (예를 들어 Form.Init)을 Form.Designer.cs 처럼 특정 폼에 종속시켜버리고 싶은 경우가 있다. 아래의 사진과 같이 말이다</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/0b9ebd21bc2ef6390c9fdc6159b00891.png)

</p>
<p>얼마나 불편해 보이는가!</p>
<p><br></p>
<p>이럴때는 csproj를 수정해서 종속을 시켜주자</p>
<p><br></p>
<p>*주의 : csproj는 코드파일처럼 열리지 않기 때문에 notepad++나 일반 메모장등으로 따로 열어주자</p>
<p><br></p>
<p>열어보면 여러 코드줄 중에서 자기 폼의 이름이 들어가 있는 줄이 있을꺼다. 예제 같은 경우 폼의 이름은 MainForm과 종속시킬 파일 이름은 MainForm.Init으로 하였다</p>

```text
...
<ItemGroup>
    <Compile Include="MainForm.cs">
      <SubType>Form</SubType>
    </Compile>
    <Compile Include="MainForm.Designer.cs">
      <DependentUpon>MainForm.cs</DependentUpon>
    </Compile>
    <Compile Include="MainForm.Init.cs">
      <SubType>Form</SubType>
    </Compile>
...
```

<p>만약 partial을 통해서 종속시켰다면 위와 같이 되어 있을것이다. 이 상태에서 <b><SubType>Form</SubType></b> 이 부분을 지우고 위에 Desinger 코드 밑에 있는 <b><DependentUpon>종속시킬 폼의 이름.cs</DependentUpon> </b>으로 바꾸어 주면된다</p>

```text
...
<ItemGroup>
    <Compile Include="MainForm.cs">
      <SubType>Form</SubType>
    </Compile>
    <Compile Include="MainForm.Designer.cs">
      <DependentUpon>MainForm.cs</DependentUpon>
    </Compile>
    <Compile Include="MainForm.Init.cs">
      <DependentUpon>MainForm.cs</DependentUpon>
    </Compile>
...
```

<p>이렇게 하면 종속이 완료된것이다</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/be5fad155c8880cbd8c79dac7b73830e.png)

</p>
<p>봐라, 얼마나 깔끔해졌는가!</p>
<p><br></p>
<p>* 참고로 종속된 파일은 Designer와 마찬가지로 이름을 변경할 수 없다. 변경하고 싶다면 csproj를 이용해야 한다.</p>
<hr>
<p>재밌는 사실을 하나 알려주자면 폼이 아닌 일반 cs파일에도 종속이 가능하다. 단 위와같은 형태처럼 SubType이 없고 <<b>Compile Include="파일.cs" /></b> 형태로 되어 있기 때문에 변경이 필요하다</p>
<p><br></p>
<p>예를 들어 Program.cs에 Program.Init.cs를 종속시키고 싶다면</p>

```text
...
<Compile Include="Program.cs" />
<Compile Include="Program.Init.cs" />
...
```

<p>위와 같은 코드를 아래와 같이 변경해주면 된다.</p>

```text
...
<Compile Include="Program.cs" />
<Compile Include="Program.Init.cs">
    <DependentUpon>Program.cs</DependentUpon>
</Compile>
...
```

<p>이러한 종속 기능으로 솔루션 탐색기를 좀더 깔끔하게 만들수 있을것이다!</p>
