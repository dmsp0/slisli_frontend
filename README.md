### [중앙정보기술인재개발원] 클라우드 데브옵스 프론트엔드&백엔드 자바(JAVA) 풀스택 개발자 취업캠프
# SpringBoot & React Project
![slisli](https://github.com/dmsp0/slisli_frontend/assets/156063957/bec63d81-fbfd-47e8-94c1-81a116cd3a64)


<strong>[SLISLI] Web RTC를 활용한 화상 설명회가 가능한 박람회 및 설명회 웹사이트   
## 🗓 개발 기간  
<strong> 2024-05-27 ~ 2024-06-26   

## 💁‍♀️ 팀원 소개   
### 조장

*  백은혜: 구조 설계, 채팅, 회원가입 유효성검사, 아아디 기억하기, GIT 브랜치 관리  

### 조원

*  박민경: 부스 디자인, 회의 기록 관리

*  박지혜: 마이페이지 설계, 회의 기록 관리

*  서유진: 이메일 인증코드, 소셜 로그인, 마이페이지&부스페이지 디자인

*  이인왕: web rtc, 비디오룸 디자인, 부스 디테일 페이지 기능

*  조현진: 부스, 등록한 부스 리스트, 배포, aws 서버 연동, 부스 페이지 디자인

*  홍승연: JWT, SSE, 좋아요, 메인페이지, 로그인/회원가입, 정보수정, 마이페이지&로그인페이지 디자인   
  


## 🖥 프로젝트 소개
디지털 시대의 발전과 함께 온라인 상에서의 소통과 협력이 더욱 중요해지고 있습니다. 특히 최근 몇 년간 비대면 활동이 증가하면서 원격 화상회의 및 가상 이벤트의 수요가 급증했습니다.

기존의 화상회의 솔루션은 단순히 얼굴을 마주 보고 대화하는 데 그쳤으나, 더욱 몰입감 있고 상호작용이 풍부한 가상 환경의 필요성이 대두되고 있습니다. 이에 따라 WebRTC 기술을 결합한 새로운 형태의 화상회의 플랫폼을 개발하여 사용자에게 더욱 생동감 있는 경험을 제공하고자 합니다.

이 플랫폼은 WebRTC를 활용한 실시간 통신 기술과 다양한 API를 결합하여, 회의 중 발생하는 데이터를 실시간으로 추출하고 분석할 수 있는 기능을 구현합니다. 이를 통해 회의의 효율성을 높이고, 의사결정에 필요한 인사이트를 제공하고자 합니다. 또한, 장소와 구분 없이 누구나 참여할 수 있으며, 개인 작가나 신인 작가들이 자신의 공간을 마련할 수 있는 기능도 제공합니다.



## ⚙️ 개발 환경
<details>
<summary>접기/펼치기</summary>

  
![7](https://github.com/dmsp0/slisli_frontend/assets/156063957/dbaf9fd4-21ed-4c18-ac86-02a1a6c41104)   
</details>


## ▶️ WBS
<details>
<summary>접기/펼치기</summary>
  
![10](https://github.com/dmsp0/slisli_frontend/assets/156063957/34a3d46e-0e5b-44bd-911b-43065cc89164)   
</details>


## ▶️ 화면정의서
<details>
<summary>접기/펼치기</summary>
  
![11](https://github.com/dmsp0/slisli_frontend/assets/156063957/b3758061-6f7c-4d4b-adae-e8ee9e0d2772)   
</details>


## ▶️ 요구사항 정의서
<details>
<summary>접기/펼치기</summary>
  
![요구사항정의서](https://github.com/dmsp0/slisli_frontend/assets/156063957/9c3fdec6-990c-4bb2-a687-ad326469ae0d)   
</details>

## ▶️ API 명세서 
<details>
<summary>접기/펼치기</summary>

![slisli](https://github.com/dmsp0/slisli_frontend/assets/156063957/33e9003f-68d6-4103-82e2-8525e97a6d85)

![slisli (1)](https://github.com/dmsp0/slisli_frontend/assets/156063957/13f18ff4-6044-4e11-9a27-0b9f9de9ef3a)   
</details>

## ▶️ ERD
<details>
<summary>접기/펼치기</summary>
  
![KakaoTalk_20240625_161550396](https://github.com/dmsp0/slisli_frontend/assets/156063957/45e4ee4f-48fd-4dc3-8fb7-e28aa869ea59)   
</details>

## 💾 프로그램 구현
<details>
<summary>접기/펼치기</summary>
  
### 1.메인 페이지 
- 부스, 개최자, 유저 수 카운팅  
- framer 를 활용한 animation  
![image](https://github.com/dmsp0/slisli_frontend/assets/156065910/42f6b4e2-f0f3-457d-8395-933b65a4fc2e)   

### 2.사용자 인증
- 회원가입 코드  
- 이메일 인증 코드  
![image](https://github.com/dmsp0/slisli_frontend/assets/156065910/aa803843-080c-4c9f-b31e-9dca6719102c)   

- 로그인 코드  
![image](https://github.com/dmsp0/slisli_frontend/assets/156065910/ae3b8e21-eb2a-4470-8954-5a9840b657d5)  

### 3.소셜 로그인  
- 소셜 로그인 코드  
![image](https://github.com/dmsp0/slisli_frontend/assets/156065910/f27d0639-4bd7-4053-b0ec-8fab8a91669c)  

### 4.정보수정 및 탈퇴  
- 정보수정 코드  
- 정보삭제 후 탈퇴 코드  
![image](https://github.com/dmsp0/slisli_frontend/assets/156065910/8acd4d38-c8a1-4499-b0b9-17454e604794)  

### 5.부스 등록  
- 부스 생성 코드  
![image](https://github.com/dmsp0/slisli_frontend/assets/156065910/1f0d3e10-c5a6-4b60-a3b1-942c29129344)     

### 6.부스 리스트  
- 부스 리스트 코드  
![image](https://github.com/dmsp0/slisli_frontend/assets/156065910/7e7e3fc4-d604-43c3-861c-eb516782cd7f)   
</details>

## 📽 주요 기능 시연
<details>
<summary>접기/펼치기</summary>
  
YouTube 시연 영상  
(https://youtube.com/)  
</details>


## 🔨 추후 개선 사항  
<details>
<summary>접기/펼치기</summary>

1. **녹화 기능**
   - 녹화 기능 API (Agora Recording API, Zoom API 등)를 이용해 회의에 참가하지 못한 이용자에게 회의 녹화본 제공
   
2. **자막 기능**
   - 실시간 자막 기능을 도입하여, 회의 참여자에게 외국어 자막 제공
   - Socket.IO를 사용하여 실시간 통신을 유지하고, Google Cloud Translation API 또는 Microsoft Azure Translator를 활용하여 텍스트를 다른 언어로 번역하여 자막으로 제공

3. **신고 기능**
   - 사용자 편의를 위해 채팅창에 신고기능 도입

4. **향후 계획**
   - 외국어 자막을 제공하여, 외국인들이 시간과 장소에 구애받지 않고 화상 설명회 및 박람회에 참여할 수 있는 환경 제공
   - 한국 이용자에 국한되지 않고 글로벌 사용자들을 대상으로 확장
</details>


## ⚙️ 사용한 문서 도구
<details>
<summary>접기/펼치기</summary>
  
백엔드 : [바로가기](https://github.com/dmsp0/slisli_backend)  
프론트 : [바로가기](https://github.com/dmsp0/slisli_frontend)  
채팅서버 : [바로가기](https://github.com/dmsp0/slisli_chatserver)  
노션 : [바로가기](https://www.notion.so/joongang-slisli/1e80165e962448cba58782823cbcbbdd)  
피그마 : [바로가기](https://www.figma.com/proto/kEE6MULmHvQalmF4K49FpD/Untitled?node-id=0-1&t=sQGXDKfcBaiHP85Q-1)  
구글 드라이브 : [바로가기](https://drive.google.com/drive/u/0/folders/1yi1ZDd0qQ-GlMoYSYhMs02jTzSB34Ptz)
</details>

