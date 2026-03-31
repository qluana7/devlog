---
title: "한글 조합 안됨 문제, 윈도우 단축키 문제"
slug: "hangul-error"
date: "2021-06-09"
excerpt: "오늘은 한글조합이 안되는 문제를 가지고 왔다. ​ 윈도우 단축키 중에는 Windows + H : 참 메뉴의 공유를 바로 호출한다. 이러한 단축키가 있는데 ​ 이 단축키에 문제가 있다. 바로 이 단축키를 입력하는 순간 다음과 같은 이미지가 나오면서 한글이 조합이 되지 않"
tags:
  - "textinputapplication"
  - "textinputhost"
  - "윈도우10"
  - "한글안됨"
  - "한글조합"
  - "한글조합안됨"
---

<p id="SE-75cbcdb8-7297-466b-8506-505340bf2950">오늘은 한글조합이 안되는 문제를 가지고 왔다.</p>
<p id="SE-f4d0f38a-8cf8-4132-8e28-cc9936973948">​</p>
<p id="SE-c6728e14-0a8a-4b49-a787-9c284ec3bdea">윈도우 단축키 중에는</p>
<p id="SE-438d91a5-36a4-4876-bcfc-66e618f2f4d9">Windows + H : 참 메뉴의 공유를 바로 호출한다.</p>
<p id="SE-5553f1ae-5032-4c2e-9a39-ca31de68369b">이러한 단축키가 있는데</p>
<p id="SE-606ba2bb-e2aa-4bbe-99b7-19f859b46755">​</p>
<p>이 단축키에 문제가 있다. 바로 이 단축키를 입력하는 순간 다음과 같은 이미지가 나오면서 한글이 조합이 되지 않는다</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/f8f23173fc5776e9edb2dfbac26dfb5c.png)

</p>
<p id="SE-55316def-0ffb-4142-9b7c-fb02ee882059">Alt + F4 장난에 더불어 이도 많은 채팅방이나 커뮤니티에서 사용되고 있는 장난인데</p>
<p id="SE-8a3cb8e9-1fbf-4f07-8805-a5acd06611d0">이를 오늘 해결해보고자 한다</p>
<p id="SE-d1d86fcc-f87f-414a-a0de-a6e5c06a95a7">​</p>
<p id="SE-7c08afee-1db4-4bae-b930-bc77a21d4615">해당 문제는 TextInputHost를 종료하는 것으로 간단하게 해결할 수 있다.</p>
<p id="SE-f3ff5123-2715-4a18-9d9a-e1f9f465f49e">​</p>
<p id="SE-a6226b4a-79dc-4714-972d-1758fea038c6">일단 Ctrl + Alt + Del > 작업관리자, 또는 Ctrl + Shift + ESC를 통해서 작업관리자를 연다</p>
<p id="SE-ec613a2c-9110-446f-a96a-839b029e6b4c">그 다음 작업관리자에서 세부정보로 간다</p>
<p id="SE-2fab9ca4-fd59-4ea5-856c-356576d94613">세부 정보 중에서 TextInputHost를 찾으면 되는데 아무 프로세스나 클릭하고 철자를 차례대로 입력하면 바로 찾아진다.</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/7ebe57c0f4ad1d9da66ee1d84e7041e7.png)

</p>
<p id="SE-4799037c-a506-4421-8f36-c30ee82188bc">이를 찾았다면 작업끝내기로 종료를 해준다. 그렇게 하면 TextInputHost가 재시작되면서 한글이 조합되어 나오게 된다.</p>
<p id="SE-7441edb9-5584-44f6-b1c5-76450816c7d3">​</p>
<p id="SE-e9536fd9-c0ec-46e7-99c6-99aa9d26078d">이가 어렵다면 간단하게 해결하는 방법이 있다.</p>
<p id="SE-8e974fd6-2d85-426e-a601-7b290d11f7d5">컴퓨터를 껐다가 키게되면 TextInputHost도 재시작되어 고쳐진다.</p>
<p id="SE-154991aa-3bf2-4c43-8e9e-d457c099b530">​</p>
<p id="SE-08ccedc4-3906-496a-8edf-9b3b0c33e743">한글 조합이 안된다면 당황하지 말고 이 방법을 통해서 원래대로 복구해보자.</p>
<p id="SE-eba61d7f-a5c0-4156-860c-f08ac150ac90">​</p>
<p id="SE-12e3ceaf-bf5d-44e8-aa2b-f05bc8b1cc36">혹시 다른 아는 방법이 있다면 댓글로 공유해보자</p>
