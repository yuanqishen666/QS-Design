# 领域内容与数据

用真实内容、对象关系和数据形态决定页面表达。先看领域覆盖、单位、基准面与时间语义；缺少合适数据时明确使用演示数据。

本文件有 10 个来源条目，来自 2026-10-27 的调研快照。下面保留当时的读取范围；未读取、未操作或未确认的部分不会因收入目录而变成已验证。

## 按问题定位

先用目录或 ID 找到相关条目，再打开能填补当前缺口的原文。无需从头读完本文件。可在仓库根目录检索：

```sh
rg -n '潮汐|地图|食品|data-' skills/qs-ios-design/references/sources/domain-content.md
```

[返回来源路由](../source-registry.md) · [按任务找案例](../examples/index.md)

<a id="group-data"></a>
## 真实内容与领域数据

| 条目 | 可解决的问题 |
|---|---|
| [Open-Meteo](#data-openmeteo) · `data-openmeteo` | 天气时间线、户外时间窗、天气图形 |
| [Natural Earth](#data-naturalearth) · `data-naturalearth` | 旅行总览、地理主题、离线原创地图 |
| [OpenStreetMap](#data-osm) · `data-osm` | 地点关系、路线概览、区域浏览 |
| [GBIF](#data-gbif) · `data-gbif` | 自然观察、物种图鉴、地点记录 |
| [USGS — Earthquake GeoJSON](#data-usgs) · `data-usgs` | 地图与时间联动、事件严重度表达 |
| [Project Gutenberg](#data-gutenberg) · `data-gutenberg` | 阅读、排印、注释、章节导航 |
| [MusicBrainz](#data-musicbrainz) · `data-musicbrainz` | 音乐作品、艺术家、专辑与曲目关系 |
| [Open Library](#candidate-openlibrary) · `candidate-openlibrary` | 真实书名、作者、版本关系与阅读收藏 |
| [NOAA CO-OPS — Tides & Currents](#data-noaa) · `data-noaa` | 潮汐、水位、流速与站点时间序列 |
| [Open Food Facts](#data-openfoodfacts) · `data-openfoodfacts` | 食品实体、成分比较、购物与扫描原型 |

<a id="data-openmeteo"></a>
### data-openmeteo · Open-Meteo

- **URL**：[https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
- **适用问题**：天气时间线、户外时间窗、天气图形
- **平台**：JSON API / 跨平台
- **类型**：domain-data；原分类 `data`
- **具体入口或例子**：小时/日预报文档；Marine 与 Geocoding 入口
- **访问范围**：公开文档；服务额度及商业用途按当前方案
- **采用时的边界**：先取任务所需的有限字段做本地快照；不能默认免费商业服务，原型不依赖每次联网。
- **实际读取范围**：已读 API 文档，未发起 API 请求
- **调研日期**：2026-10-27

<a id="data-naturalearth"></a>
### data-naturalearth · Natural Earth

- **URL**：[https://www.naturalearthdata.com/about/terms-of-use/](https://www.naturalearthdata.com/about/terms-of-use/)
- **适用问题**：旅行总览、地理主题、离线原创地图
- **平台**：地图矢量 / 栅格
- **类型**：domain-data；原分类 `data`
- **具体入口或例子**：不同尺度的地理数据与官方使用条款
- **访问范围**：公开；官方声明地图数据 public domain
- **采用时的边界**：适合概览，不足以替代精细导航地图；能据数据自行绘制不同风格。
- **实际读取范围**：已读官方使用条款
- **调研日期**：2026-10-27

<a id="data-osm"></a>
### data-osm · OpenStreetMap

- **URL**：[https://www.openstreetmap.org/copyright](https://www.openstreetmap.org/copyright)
- **适用问题**：地点关系、路线概览、区域浏览
- **平台**：地图数据 / 跨平台
- **类型**：domain-data；原分类 `data`
- **具体入口或例子**：ODbL 数据与 tile / API / Nominatim 政策入口
- **访问范围**：开放数据；需署名并遵循对应数据与服务条款
- **采用时的边界**：数据开放不等于公共瓦片/API 可无上限使用；原型可优先合法本地数据或自行绘制地图。
- **实际读取范围**：已读官方版权及政策入口
- **调研日期**：2026-10-27

<a id="data-gbif"></a>
### data-gbif · GBIF

- **URL**：[https://techdocs.gbif.org/en/openapi/](https://techdocs.gbif.org/en/openapi/)
- **适用问题**：自然观察、物种图鉴、地点记录
- **平台**：JSON API / 跨平台
- **类型**：domain-data；原分类 `data`
- **具体入口或例子**：Species、Occurrence、Maps 等文档
- **访问范围**：公开 API 文档，有请求限制
- **采用时的边界**：记录、照片等许可分别看来源；网站不是无限制公共 API。可做真实领域示例，不应捏造实际发现记录。
- **实际读取范围**：已读官方开发文档；未调用 API
- **调研日期**：2026-10-27

<a id="data-usgs"></a>
### data-usgs · USGS — Earthquake GeoJSON

- **URL**：[https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)
- **适用问题**：地图与时间联动、事件严重度表达
- **平台**：GeoJSON / 跨平台
- **类型**：domain-data；原分类 `data`
- **具体入口或例子**：按时间窗的地震 feed 与字段定义
- **访问范围**：公开 feed 文档
- **采用时的边界**：取一份带时间戳快照用于演示；不把原型宣传为可靠的紧急预警服务。
- **实际读取范围**：已读官方 schema/feed 文档
- **调研日期**：2026-10-27

<a id="data-gutenberg"></a>
### data-gutenberg · Project Gutenberg

- **URL**：[https://www.gutenberg.org/policy/license.html](https://www.gutenberg.org/policy/license.html)
- **适用问题**：阅读、排印、注释、章节导航
- **平台**：长篇文本 / EPUB
- **类型**：domain-data；原分类 `data`
- **具体入口或例子**：电子书与官方许可说明
- **访问范围**：公开；具体书籍与司法辖区可能不同
- **采用时的边界**：用真实长度的段落和章节组织页面；不能一概称为全球公版，少数作品只有站点获许可。
- **实际读取范围**：已读官方许可政策
- **调研日期**：2026-10-27

<a id="data-musicbrainz"></a>
### data-musicbrainz · MusicBrainz

- **URL**：[https://musicbrainz.org/doc/MusicBrainz_API](https://musicbrainz.org/doc/MusicBrainz_API)
- **适用问题**：音乐作品、艺术家、专辑与曲目关系
- **平台**：JSON/XML API / 跨平台
- **类型**：domain-data；原分类 `data`
- **具体入口或例子**：官方 API Examples、关系查询、实体检索
- **访问范围**：文档公开；非商业服务免费；商业方案另见 MetaBrainz
- **采用时的边界**：当前文档要求有效 User-Agent 且不超过每秒一次；元数据不提供音频或封面使用权。设计演示宜使用有限快照。
- **实际读取范围**：已读官方 API 文档；未调用 API
- **调研日期**：2026-10-27

<a id="candidate-openlibrary"></a>
### candidate-openlibrary · Open Library

- **URL**：[https://openlibrary.org/dev/docs/api/search](https://openlibrary.org/dev/docs/api/search)
- **适用问题**：真实书名、作者、版本关系与阅读收藏
- **平台**：书籍元数据 / API
- **类型**：limited-candidate；原分类 `data`
- **具体入口或例子**：https://openlibrary.org/dev/docs/api/covers
- **访问范围**：官方搜索有结果，正文多次超时；Swagger 页面只有空壳
- **采用时的边界**：保留为候选数据源；本次未读 API 全文，不把封面可检索等同封面可再分发。
- **实际读取范围**：搜索摘要；超时/空壳
- **调研日期**：2026-10-27

<a id="data-noaa"></a>
### data-noaa · NOAA CO-OPS — Tides & Currents

- **URL**：[https://api.tidesandcurrents.noaa.gov/api/prod/](https://api.tidesandcurrents.noaa.gov/api/prod/)
- **适用问题**：潮汐、水位、流速与站点时间序列
- **平台**：JSON/CSV / 跨平台
- **类型**：domain-data；原分类 `data`
- **具体入口或例子**：predictions / high_low / water_level；按站点、时区、基准面、单位选数据
- **访问范围**：公开官方文档已读取；未实际请求数据
- **采用时的边界**：适用于有覆盖的站点，不是任意全球海滩服务；保存站点、日期、单位和基准面。本地快照可支撑 Tidefold 的同一数据多种表达，原型不作真实下水安全建议。
- **实际读取范围**：已读 API 文档及参数/使用条件；未调用 API
- **调研日期**：2026-10-27

<a id="data-openfoodfacts"></a>
### data-openfoodfacts · Open Food Facts

- **URL**：[https://openfoodfacts.github.io/openfoodfacts-server/api/](https://openfoodfacts.github.io/openfoodfacts-server/api/)
- **适用问题**：食品实体、成分比较、购物与扫描原型
- **平台**：JSON/CSV / 跨平台
- **类型**：domain-data；原分类 `data`
- **具体入口或例子**：产品成分、营养字段、图片、扫码指南及官方缓存教程
- **访问范围**：公开官方文档已读取；未实际请求数据
- **采用时的边界**：数据库 ODbL、单条内容 DbCL、产品图 CC BY-SA 等边界不同；社区数据不保证准确。采用有限快照，保留缺失字段；API 当前有速率与接入要求，不默认按键即远程搜索。
- **实际读取范围**：已读 API 文档及参数/使用条件；未调用 API
- **调研日期**：2026-10-27

