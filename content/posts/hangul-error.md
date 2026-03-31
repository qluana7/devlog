---
title: "Fixing Korean Input Composition and Windows Shortcut Issues"
slug: "hangul-error"
date: "2021-06-09"
excerpt: "오늘은 한글조합이 안되는 문제를 가지고 왔다. 윈도우 단축키 중에는 Windows + H : 참 메뉴의 공유를 바로 호출한다. 이러한 단축키가 있는데 이 단축키에 문제가 있다. 바로 이 단축키를 입력하는 순간 다음과 같은 이미지가 나오면서 한글이 조합이 되지 않는다 !"
tags:
  - "textinputapplication"
  - "textinputhost"
  - "윈도우10"
  - "한글안됨"
  - "한글조합"
  - "한글조합안됨"
---

<p>오늘은 한글조합이 안되는 문제를 가지고 왔다.</p>
<p><br></p>
<p>윈도우 단축키 중에는</p>
<p>Windows + H : 참 메뉴의 공유를 바로 호출한다.</p>
<p>이러한 단축키가 있는데</p>
<p><br></p>
<p>이 단축키에 문제가 있다. 바로 이 단축키를 입력하는 순간 다음과 같은 이미지가 나오면서 한글이 조합이 되지 않는다</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/f8f23173fc5776e9edb2dfbac26dfb5c.png)

</p>
<p>Alt + F4 장난에 더불어 이도 많은 채팅방이나 커뮤니티에서 사용되고 있는 장난인데</p>
<p>이를 오늘 해결해보고자 한다</p>
<p><br></p>
<p>해당 문제는 TextInputHost를 종료하는 것으로 간단하게 해결할 수 있다.</p>
<p><br></p>
<p>일단 Ctrl + Alt + Del > 작업관리자, 또는 Ctrl + Shift + ESC를 통해서 작업관리자를 연다</p>
<p>그 다음 작업관리자에서 세부정보로 간다</p>
<p>세부 정보 중에서 TextInputHost를 찾으면 되는데 아무 프로세스나 클릭하고 철자를 차례대로 입력하면 바로 찾아진다.</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/7ebe57c0f4ad1d9da66ee1d84e7041e7.png)

</p>
<p>이를 찾았다면 작업끝내기로 종료를 해준다. 그렇게 하면 TextInputHost가 재시작되면서 한글이 조합되어 나오게 된다.</p>
<p><br></p>
<p>이가 어렵다면 간단하게 해결하는 방법이 있다.</p>
<p>컴퓨터를 껐다가 키게되면 TextInputHost도 재시작되어 고쳐진다.</p>
<p><br></p>
<p>한글 조합이 안된다면 당황하지 말고 이 방법을 통해서 원래대로 복구해보자.</p>
<p><br></p>
<p>혹시 다른 아는 방법이 있다면 댓글로 공유해보자</p>
