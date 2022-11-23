## 프로젝트 개요

**보스레이드 PVE 컨텐츠 관련 api 구현**

> 유저 생성, 조회, 보스레이드 상태 조회, 보스레이드 시작, 종료, 랭킹 조회 기능을 구현 하였습니다.<br>

## 기술 스택
- Framework: NestJs
- Language: typescript
- ORM : typeorm
- DB : mysql 

## 요구사항 분석 및 구현 사항 정리
### 기술 관련
- radis 사용하여 랭킹 기능 구현
- 웹 캐시 사용하여 static data 활용

구현 사항 정리 예정


    
## DB Modeling
User - BossRaid : 1 - M


## API 문서
자세한 내용은 아래 링크 참조<br>
[POSTMAN DOCS](https://documenter.getpostman.com/view/11539438/2s8YmHx5Fb).
|기능구분| 기능  | Method | URL |  
|-------------| ------------- | ------------- |:-------------|
| User | 유저 생성 | POST | /user  |    
|  | 유저 조회 | GET | /user/:userId  | 
| BossRaid | 보스레이드 상태 조회 | GET  |/bossRaid|
|  |  보스레이드 시작  | POST |/bossRaid/enter |
|  |  보스레이드 종료  | PATCH |/bossRaid/end |
|  |  랭킹 조회  | POST |/bossRaid/topRankerList |

## 테스트 구현
```bash
controller 로직은 특별한 분기 없이 service 실행만 하므로 성공 했을 경우만 테스트 하였고, 
mocking한 service method의 실행여부와 response 값을 확인하는 방식으로 진행하였습니다.
```
- bossRaid controller uni test 구현
<img width="395" alt="image" src="https://user-images.githubusercontent.com/55984573/203083559-2ea80055-344e-4de2-acc9-13d715aaccbb.png">


<br>

## 설치 및 실행 방법
nodejs와 npm이 install 되어있지 않다면 먼저 install 과정 진행
<details>
    <summary> 프로젝트 설치 밀 실행 과정</summary>

<b>1. 프로젝트 clone 및 디렉토리 이동</b>
```bash
git clone https://github.com/simple_boss_raid.git
cd simple_boss_raid
```
<b>2. .env 파일 생성</b>
```bash
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
REDIS_PORT=
REDIS_HOST=
STATIC_DATA_URL=
CACHE_TTL=
```
<b>3. node package 설치</b>
```javascript
npm install
```
<b>4. 서버 실행</b>
```javascript
npm run start
```
</details>

<details>
    <summary>Test 실행 방법</summary>
    
<b>unit test 실행</b>
```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
</details>

