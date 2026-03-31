---
title: "Visual Studio 종속 파일 만들기"
slug: "vs-file-dependent"
date: "2021-06-09"
excerpt: "비주얼 스튜디오 팁 가끔 그럴때가 있다. 내가 만든 cs파일 (예를 들어 Form.Init)을 Form.Designer.cs 처럼 특정 폼에 종속시켜버리고 싶은 경우가 있다. 아래의 사진과 같이 말이다"
tags:
  - "csproj"
  - "dependentupon"
  - "from"
  - "visualstuido"
  - "비주얼스튜디오"
---

<p id="SE-0747d8ea-f45f-4b04-93c8-c4bb09feda4b">비주얼 스튜디오 팁</p>
<p>가끔 그럴때가 있다. 내가 만든 cs파일 (예를 들어 Form.Init)을 Form.Designer.cs 처럼 특정 폼에 종속시켜버리고 싶은 경우가 있다. 아래의 사진과 같이 말이다</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/0b9ebd21bc2ef6390c9fdc6159b00891.png)

</p>
<p id="SE-427f3408-5097-4a1c-9215-ead68d914436">얼마나 불편해 보이는가!</p>
<p id="SE-1db3dff5-e90a-4554-8b63-d044a0c7aa4c">​</p>
<p id="SE-7878483c-05ab-4d3f-b85f-a74cf662d5b2">이럴때는 csproj를 수정해서 종속을 시켜주자</p>
<p id="SE-494a8ff2-7bc7-4feb-8138-f5482a6d748a">​</p>
<p id="SE-b0e213d8-8a96-415a-896f-63916245ce43">*주의 : csproj는 코드파일처럼 열리지 않기 때문에 notepad++나 일반 메모장등으로 따로 열어주자</p>
<p id="SE-70f6bae9-1bd5-4f7f-83b1-3328b21104e6">​</p>
<p id="SE-aa06b301-9618-4429-82c3-d3acbd0e6462">열어보면 여러 코드줄 중에서 자기 폼의 이름이 들어가 있는 줄이 있을꺼다. 예제 같은 경우 폼의 이름은 MainForm과 종속시킬 파일 이름은 MainForm.Init으로 하였다</p>

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

<p id="SE-77bd1ea2-b8a8-48c2-b213-8244978dca6f">만약 partial을 통해서 종속시켰다면 위와 같이 되어 있을것이다. 이 상태에서 <b><SubType>Form</SubType></b> 이 부분을 지우고 위에 Desinger 코드 밑에 있는 <b><DependentUpon>종속시킬 폼의 이름.cs</DependentUpon> </b>으로 바꾸어 주면된다</p>

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

<p id="SE-6525bd16-6e82-46ce-80d6-ad240ab79faf">이렇게 하면 종속이 완료된것이다</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/be5fad155c8880cbd8c79dac7b73830e.png)

</p>
<p id="SE-6c17dea1-4ba8-4199-b932-f4a2b0e62a7a">봐라, 얼마나 깔끔해졌는가!</p>
<p id="SE-ce042e35-a134-4a03-9aab-8b507920fbcf">​</p>
<p id="SE-a2e189a3-8d96-49ff-a208-b39b26ab4c07">* 참고로 종속된 파일은 Designer와 마찬가지로 이름을 변경할 수 없다. 변경하고 싶다면 csproj를 이용해야 한다.</p>
<hr contenteditable="false" />
<p id="SE-010ac31f-fd61-46e1-8108-5c3d671ba076">재밌는 사실을 하나 알려주자면 폼이 아닌 일반 cs파일에도 종속이 가능하다. 단 위와같은 형태처럼 SubType이 없고 <<b>Compile Include="파일.cs" /></b> 형태로 되어 있기 때문에 변경이 필요하다</p>
<p id="SE-79ca3966-3d4b-4748-8ac1-ab7e8eccfccc">​</p>
<p id="SE-9dfc48a5-3818-4e4b-a305-8eb86ccd8f28">예를 들어 Program.cs에 Program.Init.cs를 종속시키고 싶다면</p>

```text
...
<Compile Include="Program.cs" />
<Compile Include="Program.Init.cs" />
...
```

<p id="SE-db93da14-ec88-4ae7-b557-8fe9cc3cf110">위와 같은 코드를 아래와 같이 변경해주면 된다.</p>

```text
...
<Compile Include="Program.cs" />
<Compile Include="Program.Init.cs">
    <DependentUpon>Program.cs</DependentUpon>
</Compile>
...
```

<p id="SE-a327c1d5-e0f3-483c-830e-73bc1b88f0b5">이러한 종속 기능으로 솔루션 탐색기를 좀더 깔끔하게 만들수 있을것이다!</p>
