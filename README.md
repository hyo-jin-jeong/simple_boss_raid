## 프로젝트 개요

**보스레이드 PVE 컨텐츠 관련 api 구현**

> 유저 생성, 조회, 보스레이드 상태 조회, 보스레이드 시작, 종료, 랭킹 조회 기능을 구현 하였습니다.<br>
> 한번에 한명의 유저만 보스레이드를 진행할 수 있습니다. 실행 중인 유저가 타임아웃 되거나 종료해야 다른 유저가 입장 가능합니다. 
> 제한 시간 안에 종료 API를 호출해야 성공으로 인정되고 Score, endTime 등 데이터가 업데이트 됩니다. 


## 기술 스택
- Framework: NestJs
- Language: typescript
- ORM : typeorm
- DB : mysql, redis

## 요구사항 분석 및 구현 사항 정리
### 기술 관련
- redis 사용하여 랭킹 기능 구현
- 웹 캐시 사용하여 static data 활용

### 유저 생성
- 중복되지 않은 userId를 생성하여 응답
- 따로 유저 정보를 받지 않고 보스레이드 구현에 집중합니다.

### 유저 조회
- 해당 유저의 보스레이드 총 점수 및 보스레이드 히스토리(id, score, enterTime, endTime)를 배열로 응답

### 보스레이드 상태 조회
- 보스레이드 현재 상태 응답(입장 가능한지, 현재 실행하고 있는 유저가 있다면 userId도 반환)

### 보스레이드 시작
- 데이터베이스에서 아직 종료되지 않은 유저의 존재 여부를 확인합니다.
- 종료되지 않은 유저가 있다면 timeout 된 유저인지 확인합니다. 
- 진행중인 유저가 없다면 보스레이드를 생성한 뒤 입장했느지 
    
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

