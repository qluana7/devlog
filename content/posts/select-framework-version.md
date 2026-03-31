---
title: "닷넷 프레임워크에서 C# 8.0(9.0) 사용하기"
slug: "select-framework-version"
date: "2021-06-09"
excerpt: "C# 8.0에는 많은 기능들이 추가되었다. using 선언이라던지 인덱서의 개편등 여러 편리한 기능들이 많이 추가되었는데 닷넷프레임워크를 사용하면서 이러한 기능들을 못 누리는것은 말이 안되지 않는가? 그래서 이번에는 닷넷 프레임워크에서 C# 8.0을 사용해보려 한다. "
tags:
  - "C#"
  - "C# 8.0"
  - "c# 9.0"
  - "c# compiler"
  - "compiler"
  - "cs"
  - "csproj"
  - "langversion"
---

<p id="SE-70269240-7408-403d-ba5f-2622d0390d8d">C# 8.0에는 많은 기능들이 추가되었다. using 선언이라던지 인덱서의 개편등 여러 편리한 기능들이 많이 추가되었는데 닷넷프레임워크를 사용하면서 이러한 기능들을 못 누리는것은 말이 안되지 않는가? 그래서 이번에는 닷넷 프레임워크에서 C# 8.0을 사용해보려 한다.</p>
<p id="SE-52b7bb3d-28d1-4338-8a73-a7a8e2fdc376">​</p>
<p>C# 8.0의 기능이 궁금한 분들은 아래 링크를 들어가 보길 바란다.</p>

<div class="embed-card"><a class="embed-card-link" href="https://docs.microsoft.com/ko-kr/dotnet/csharp/whats-new/csharp-8" target="_blank" rel="noreferrer noopener"><div class="embed-card-media"><img src="https://blog.kakaocdn.net/dna/btDi1y/hyKwy35iyw/AAAAAAAAAAAAAAAAAAAAAGEz-w7H8zQQrbhPXZufHxCMO93l_EnBux6U2pa3vbbt/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1774969199&allow_ip=&allow_referer=&signature=xhIixrh5KkJTdO6mGiezLWWwy4I%3D" alt="C# 8.0의 새로운 기능 - C# 가이드" loading="lazy" /></div><div class="embed-card-body"><p class="embed-card-title">C# 8.0의 새로운 기능 - C# 가이드</p><p class="embed-card-desc">C# 8.0의 새로운 기능을 살펴봅니다.</p><p class="embed-card-host">docs.microsoft.com</p></div></a></div>

<p id="SE-7dfb318c-a81b-4801-8042-1280c95229d9">​</p>
<p id="SE-68713110-362f-43fd-8473-e00681b1c70c">닷넷 프레임워크를 사용하다보면 8.0을 사용하고 싶은 경우가 있다. 그래서 설정에 빌드 탭에서 자주 찾곤 하는데 프레임워크의 경우 기본값으로 고정이 되어있다.</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/6556bb89769bba92caa780f30f82e674.png)

</p>
<p id="SE-819fa87e-6e67-4f88-b5e4-0005b4764229">이에 따라 버전을 선택할수가 없는데 8.0 기능을 사용 가능하게 할수 있다(!!)</p>
<p id="SE-5ca1002b-99af-40d9-89e9-d26c7c055e4b">​</p>
<p id="SE-7f04349f-a900-48b6-a016-49d95c995b09">두가지 방법을 소개하겠다. 첫번째 방법이 쉬우나 두번째 방법은 8.0을 다시 7.3으로 내릴때 써야 함으로 둘다</p>
<p id="SE-d20e62d2-74cc-4536-b4ec-a00a84b31be8">기억해두자.</p>
<p id="SE-c79f416b-a995-4aee-b4d1-72554a20b50d">​</p>
<p id="SE-21e6b1e3-24cb-4484-80f7-5e36673eac6f">첫번째 방법.</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/dd55b3e866959b6c709cf0573f0a0e85.png)

</p>
<p id="SE-c29fca86-3cb6-4c75-a44d-79bcab6fcc9d">7.3 버전에서 8.0의 기능을 사용하면 컴파일러가 '나는 버전이 7.3인데 어떻게 하라구!'라며 화를 낸다</p>
<p id="SE-03d9abf4-f7d5-45da-884b-a9062d87e4e8">이럴때 잠재적 수정 사항 표시를 클릭하거나 옆에 보이는 단축키를 통해서 아래의 그림을 클릭하면 된다</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/151d30f2b4ef424f8daa51e37c011722.png)

</p>
<p id="SE-7f9fbcc9-0e28-4cd4-ab2f-da61ccd91166">그러면 8.0 업그레이드가 끝난것이다</p>
<p id="SE-a58a59af-51f2-40b3-bb39-2dad9647e286">​</p>
<p id="SE-7f349635-f982-4dde-991a-e4eccbfbb540">​</p>
<p id="SE-88ec9985-0504-42df-b251-edc26da7f210">두번째 방법.</p>
<p id="SE-556e7688-825f-467f-96b6-be9fcccb4822">첫번째 방법중에 의문점이 하나 든다.</p>
<p id="SE-2da20cef-2bd2-41d7-b792-6bd1afd43255">​</p>
<p id="SE-28be3027-a0a1-4af3-bc4a-e0f10afb942f">"8.0이라는 버전 표시는 어디에 명시 되어있는가?"</p>
<p id="SE-0e5bd0dd-c6cf-493f-8a0a-731057ff598c">​</p>
<p id="SE-d2f6f484-ec0e-43de-9e1d-b1265daa40ef">해당 의문점을 해결하기 위해서 프로젝트 파일을 열어보다가 발견했다. 이는 csproj에 명시되어 있다.</p>
<p id="SE-ff807745-6030-47b2-acae-aa85c48321fe">​</p>
<p id="SE-904217b9-4922-4e2d-b12c-2500114cb602">csproj를 열어보면 <b><PropertyGroup></b> 이라는 것이 존재한다. 이중에서 세가지 프로퍼티를 찾을수 있는데</p>

```text
<PropertyGroup>
<PropertyGroup Condition=" '$(Configuration)|$(Platform)' == 'Debug|AnyCPU' ">
<PropertyGroup Condition=" '$(Configuration)|$(Platform)' == 'Release|AnyCPU' ">
```

<p><br></p>
<p id="SE-19110163-70c7-4116-8928-6b522e9cd2af">일반적으로 이렇게 3가지의 프로퍼티가 구현이 되어 있다. 이중 가운데에 있는 프로퍼티와 마지막줄의 프로퍼티만 수정을 하면 된다.</p>
<p id="SE-c91dc228-2b54-4569-bdbe-c8964d0b59d5">​</p>
<p id="SE-f1663156-a593-4dfc-a17e-a8e0cf9279bc">보이는 것과 같이 가운데는 Debug 상태로 편집을 할때의 참조값이고 아래는 Release 상태로 편집을 할때의 참조값이다</p>
<p id="SE-c61bc280-75b8-4b7a-b45c-04fc8a16db01">​</p>
<p id="SE-388281fe-ecfd-405d-a82a-a5dc968e7186">Debug 상태에서 위 첫번째 방법을 수행했다면 해당 프로퍼티 안에 이러한 코드가 삽입이 되어 있을것이다.</p>

```text
<LangVersion>8.0</LangVersion>
```

<p id="SE-39eb37ea-e008-4627-85e9-b562db06b2b6">이를 통해서 컴파일러가 8.0이라는 것을 인식하게 된다. 그렇다면 이를 Release 프로퍼티에 넣으면 Release도 똑같이 작동하지 않겠는가? 실제로 컴파일러는 위와같이 작동한다.</p>
<p id="SE-3a08e565-30a7-437c-a9e5-26d4f87b50e7">​</p>
<p id="SE-b2e26ee5-d09c-4e10-a496-cf2e252092a2">만약 8.0으로 올린 뒤에 7.3으로 다시 다운을 하고 싶을 수도 있다. 이럴때는 간단하게 위의 코드를 지워버리면 된다.</p>
<p id="SE-e3072cef-58de-46e3-8ddf-745285f92730">​</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/a8b178d4b774e63b64a076baa882da3f.png)

</p>
<p id="SE-195d93d9-01fb-4e65-bafa-31064cbb7884">몇가지 재밌는 것은 Debug에는 8.0이라 적고 Release에는 7.3이라고 적으면 컴파일러는 이를 다르게 인식한다.</p>
<p id="SE-d5488c6b-23a2-4669-9248-fe445bc79889">또한 LangVersion 값에 5.0같은 값을 넣게 되면 컴파일러는 5.0버전으로 컴파일을 진행한다.</p>
<p><br></p>
<p>+ 블로그를 옮기면서 가져온 글이라서 8.0 릴리즈 당시에 만들었던 거다. 지금은 C# 9.0까지 나온 걸로 아는데</p>
<p>저 부분에서 9.0으로 고쳐도 9.0 컴파일 해준다. 바꾸는게 귀찮다면 그냥 preview라고 적어두면 알아서 preview 버전을 찾아서 컴파일 해준다.</p>
<p>그리고 Framework의 경우 framework 버전마다 맞는 버전이 정해져 있으며 바꿔도 상관은 없다.</p>
<p>Net Core의 경우 프로젝트 설정에 들어가면 Net 5.0까지 올릴 수 있는데, Net 5.0으로 올리면 자동으로 컴파일러 버전이 올라가서 따로 작업을 안해줘도 된다.</p>
