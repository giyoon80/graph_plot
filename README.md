# graph_plot

그래프 이미지의 축을 보정하고 데이터 포인트를 CSV로 추출하는 브라우저 기반 도구입니다.

서비스: https://graphplot.shop/

## Cloudflare Pages 배포

이 저장소는 빌드 과정이나 서버 런타임이 필요 없는 정적 사이트입니다. Cloudflare Pages에서 다음과 같이 설정합니다.

- Framework preset: `None`
- Build command: 비워 두기
- Build output directory: `.`
- Production branch: `main`

Git 저장소를 연결하면 `main` 브랜치의 변경 사항이 자동으로 배포됩니다. 커스텀 도메인은 Cloudflare Pages 프로젝트의 **Custom domains**에서 `graphplot.shop`을 연결합니다.

응답 헤더는 Cloudflare Pages가 배포 시 읽는 [`_headers`](./_headers)에서 관리합니다.

## 코드 구조

- `index.html`: 메인 도구의 문서 구조와 외부 서비스 로더
- `app.css`: 메인 도구의 레이아웃, 테마 및 반응형 스타일
- `app.js`: 이미지 좌표 보정, 데이터 포인트 관리 및 내보내기 로직
- `app-translations.js`: 메인 도구의 다국어 문구
- `info.css`, `info.js`: 안내 페이지 공통 스타일과 언어 처리
- `info-translations.js`: 사용 가이드의 다국어 문구
- `en/`, `ja/`, `zh-cn/`: 검색 엔진용 언어별 소개 페이지
- `_headers`: Cloudflare Pages 응답 헤더와 캐시 정책

## 로컬 실행

루트 디렉터리를 정적 웹 서버로 제공하면 됩니다.

```sh
python3 -m http.server 8080
```

그런 다음 http://localhost:8080/ 에 접속합니다.
