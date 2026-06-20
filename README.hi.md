<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/repo-knowledge/readme.png" alt="repo-knowledge" width="500" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/repo-knowledge/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/repo-knowledge/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/repo-knowledge"><img src="https://img.shields.io/npm/v/@mcptoolshop/repo-knowledge" alt="npm version" /></a>
  <a href="https://github.com/mcp-tool-shop-org/repo-knowledge/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/repo-knowledge/"><img src="https://img.shields.io/badge/docs-landing%20page-34d399" alt="Landing Page" /></a>
</p>

<p align="center">
  Local-first repo knowledge system built on SQLite and FTS5. Catalogs repositories with structured metadata, thesis notes, architecture docs, audit evidence, and inter-repo relationships — then exposes everything through a CLI and MCP server for AI-integrated workflows.
</p>

---

## क्यों

पैकेज रजिस्ट्री और GitHub API आपको बताते हैं कि एक रिपॉजिटरी क्या है। वे आपको यह नहीं बताते कि इसका उपयोग किस लिए किया जाता है, यह आपके अन्य रिपॉजिटरी से कैसे संबंधित है, इसकी आर्किटेक्चरल थीसिस क्या है, या क्या इसने आपके अंतिम सुरक्षा ऑडिट को पास किया। repo-knowledge इस अंतर को भरता है: एक एकल स्थानीय डेटाबेस जिसमें थीसिस, आर्किटेक्चर, ऑडिट प्रमाण, संबंध और सभी में पूर्ण-पाठ खोज शामिल है।

## इंस्टॉल करें

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**आवश्यकताएं:**
- Node.js 20+
- GitHub सिंक के लिए `gh` CLI (प्रमाणीकृत)
- `better-sqlite3` के लिए C/C++ बिल्ड टूल, या समर्थित प्लेटफ़ॉर्म पर स्वचालित रूप से प्रीबिल्ट बाइनरी का उपयोग किया जाएगा।

## सुरक्षा मॉडल

**उपयोग किए गए डेटा:** स्थानीय SQLite डेटाबेस, `gh` CLI के माध्यम से GitHub API मेटाडेटा (रिपॉजिटरी नाम, विवरण, विषय, सितारे - कोई स्रोत कोड सामग्री नहीं)।

**उपयोग न किया गया डेटा:** GitHub से कोई भी स्रोत कोड नहीं पढ़ा जाता है, कोई क्रेडेंशियल संग्रहीत नहीं किए जाते हैं, और कोई डेटा बाहरी सेवाओं को नहीं भेजा जाता है।

**अनुमतियाँ:** GitHub सिंक के लिए `gh` CLI प्रमाणीकरण की आवश्यकता होती है; सभी डेटा स्थानीय रूप से रहता है।

**कोई टेलीमेट्री नहीं, कोई एनालिटिक्स नहीं, कोई होम-कनेक्शन नहीं।**

## त्वरित शुरुआत

```bash
# Initialize workspace — creates config, database, seeds audit controls
rk init

# Sync repos from your GitHub org
rk sync --owners my-org

# Include forked repos
rk sync --owners my-org --forks

# Inspect a specific repo
rk show my-org/my-repo

# Search across everything
rk find "authentication middleware"

# Seed the 80-control audit framework
rk audit seed-controls
```

## CLI संदर्भ

### मुख्य कमांड

| कमांड | विवरण |
|---------|-------------|
| `rk init` | कॉन्फ़िगरेशन, डेटाबेस और सीड ऑडिट नियंत्रण को आरंभ करें। |
| `rk sync` | पूर्ण सिंक: GitHub संगठन + स्थानीय रिपॉजिटरी + FTS इंडेक्स |
| `rk scan <path>` | एकल स्थानीय रिपॉजिटरी निर्देशिका स्कैन करें |
| `rk show <slug>` | ऑडिट स्थिति के साथ पूर्ण रिपॉजिटरी ज्ञान दिखाएं। |
| `rk list` | सभी रिपॉजिटरी सूचीबद्ध करें (स्थिति, भाषा, आकार के अनुसार फ़िल्टर किया जा सकता है)। |
| `rk find <query>` | सभी अनुक्रमित सामग्री में पूर्ण-पाठ खोज करें। |
| `rk related <slug>` | दिए गए रिपॉजिटरी से संबंधित रिपॉजिटरी दिखाएं। |
| `rk note <slug>` | एक टाइप किया हुआ नोट जोड़ें (थीसिस, आर्किटेक्चर, चेतावनी, आदि) `--type` और `--content` के साथ (वैकल्पिक `--title`)। |
| `rk relate <from> <type> <to>` | रिपॉजिटरी के बीच एक संबंध रिकॉर्ड करें (वैकल्पिक `--note`)। |
| `rk stats` | डेटाबेस आँकड़े दिखाएं। |
| `rk reindex` | FTS इंडेक्स को फिर से बनाएं। |
| `rk sync-dogfood` | dogfood-lab/testing-os से रिपॉजिटरी तथ्यों में dogfood प्रमाण सिंक करें। |
| `rk suggest-dogfood --repo <slug>` | किसी रिपॉजिटरी या सतह के लिए ज्ञात dogfood निष्कर्षों का सुझाव दें। |

> **`--json` हर जगह जहां यह मायने रखता है।** `list`, `find`, `show`, `related`, और `stats` - साथ ही पांच ऑडिट रीड (`posture`, `findings`, `controls`, `unaudited`, `failing`) - सभी मशीन-पठनीय आउटपुट के लिए `--json` स्वीकार करते हैं। JSON मुख्य कमांड में एक महत्वपूर्ण अनुबंध है: उनमें से किसी को भी सीधे `jq` में पाइप करें।

### लाइफसाइकिल कमांड (v2.0.0)

| कमांड | विवरण |
|---------|-------------|
| `rk delete <slug> [--yes]` | एक रिपॉजिटरी और सभी चाइल्ड पंक्तियों को कैस्केड-डिलीट करें। |
| `rk archive <slug> [--reason <text>]` | `lifecycle_status` को `archived` में बदलें (नोट/निष्कर्षों को सुरक्षित रखता है)। |
| `rk verify-local [--rig <id>] [--strict]` | प्रत्येक रिग के लिए `local_path` मौजूद है, यह सत्यापित करें; `repo_local_paths` अपडेट करता है। |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | वर्तमान रिग पंजीकृत करें। |
| `rk prune [--dry-run] [--apply] [--days <N>]` | N दिनों (डिफ़ॉल्ट 30) से अधिक समय तक संग्रहीत रिपॉजिटरी को हार्ड-डिलीट करें। |

### प्रकाशित-अवस्था कमांड (v2.0.0)

| कमांड | विवरण |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | क्रॉस-चैनल प्रकाशित-संस्करण डैशबोर्ड (npm/pypi/github_release)। |
| `rk drift <slug> [--strict]` | सत्य के स्रोत संस्करण की तुलना नवीनतम रजिस्ट्री से करें। |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | मैनुअल बाइंडिंग सेटटर। |

### स्वास्थ्य कमांड (v2.0.0 - अनुसंधान-आधारित)

| कमांड | विवरण |
|---------|-------------|
| `rk health` (डिफ़ॉल्ट = फ़ीड)। | फ़ीड बदलें: अंतिम सिंक, KEV इंटरसेक्शन, CI स्ट्रीक ब्रेक, एक्शन-पिन ड्रिफ्ट के बाद से परिवर्तन। |
| `rk health doctor <slug>` | एकल-रिपॉजिटरी गहन विश्लेषण (निर्भरता ऑडिट, वर्कफ़्लो क्रियाएं, CI सिग्नल, टूलचेन)। |
| `rk health table [--json\ | --text]` | पोर्टफोलियो स्वास्थ्य तालिका; JSON एक महत्वपूर्ण अनुबंध है। |

### परिचालन कमांड (v2.0.0)

| कमांड | विवरण |
|---------|-------------|
| `rk fsck [--strict] [--json]` | DB अखंडता जांच; ऑडिट पंक्ति को `db_health_runs` में लिखता है। |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | एक रिपॉजिटरी के लिए प्रविष्टि परिवर्तन इतिहास। |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | हालिया `db_health_runs` / `sync_runs` प्रविष्टियाँ सूचीबद्ध करें। |
| `rk owners list` | कॉन्फ़िगर किए गए GitHub मालिकों को सूचीबद्ध करें। |
| `rk owners add <owner>` | `rk.config.json` मालिकों में जोड़ें। |
| `rk owners remove <owner>` | `rk.config.json` मालिकों से हटाएं। |

### बैकअप, पुनर्स्थापित और प्रीफ़्लाइट (v2.1.0)

| कमांड | विवरण |
|---------|-------------|
| `rk backup [--out <path>]` | ज्ञान डेटाबेस को `data/backups/` या `--out` के तहत वैक्यूम की गई कॉपी (`VACUUM INTO`) में स्नैपशॉट करें। |
| `rk restore <path> [--yes]` | स्नैपशॉट से DB पुनर्स्थापित करें - स्कीमा-मान्य, परमाणु स्वैप, पुष्टि-गेटेड (एक नए-स्कीमा बैकअप को अस्वीकार करता है)। |
| `rk doctor [--json] [--strict]` | पर्यावरण प्रीफ़्लाइट: कॉन्फ़िगरेशन, DB, स्कीमा संस्करण, `gh` प्रमाणीकरण, वर्तमान रिग, हालिया सिंक/fsck रन। |
| `rk config [--json]` | प्रति-फ़ील्ड उत्पत्ति के साथ हल किए गए प्रभावी कॉन्फ़िगरेशन को दिखाएं। |
| `rk config validate [--json]` | `rk.config.json` सत्यापित करें - प्लेसहोल्डर मालिकों, खराब आकृतियों या अनसुलझे पथों पर गैर-शून्य से बाहर निकलता है। |

### ऑडिट कमांड

| कमांड | विवरण |
|---------|-------------|
| `rk audit seed-controls` | 80-नियंत्रण कैनोनिकल कैटलॉग को सीड/अपडेट करें। |
| `rk audit import <dir>` | JSON अनुबंध फ़ाइलों से ऑडिट परिणाम आयात करें। |
| `rk audit posture [slug]` | एक रिपॉजिटरी या पूर्ण पोर्टफोलियो के लिए ऑडिट स्थिति दिखाएं। |
| `rk audit findings` | पोर्टफोलियो में खुले निष्कर्षों को सूचीबद्ध करें। |
| `rk audit controls` | डोमेन द्वारा कैनोनिकल नियंत्रण सूचीबद्ध करें। |
| `rk audit unaudited` | उन रिपॉजिटरी को सूचीबद्ध करें जिनमें कोई ऑडिट रन नहीं है। |
| `rk audit failing <domain>` | एक विशिष्ट ऑडिट डोमेन में विफल होने वाली रिपॉजिटरी को सूचीबद्ध करें। |

### गेम्स कमांड

| कमांड | विवरण |
|---------|-------------|
| `rk games score <worklist>` | REMEDIATION-WORKLIST.md स्कोर करें और लीडरबोर्ड दिखाएं। |

## MCP सर्वर

MCP सर्वर AI-एकीकृत वर्कफ़्लो के लिए 30 टूल उजागर करता है। इसे अपने MCP क्लाइंट कॉन्फ़िगरेशन में जोड़ें:

**Claude Code (परियोजना-विशिष्ट `.claude.json`):**
```json
{
  "mcpServers": {
    "repo-knowledge": {
      "command": "rk",
      "args": ["mcp"],
      "env": {}
    }
  }
}
```

**Claude Desktop (`claude_desktop_config.json`):**
```json
{
  "mcpServers": {
    "repo-knowledge": {
      "command": "node",
      "args": ["node_modules/@mcptoolshop/repo-knowledge/dist/mcp/server.js"]
    }
  }
}
```

सर्वर स्टार्टअप पर कार्यशील निर्देशिका से `rk.config.json` पढ़ता है। सुनिश्चित करें कि सर्वर चलाने वाली निर्देशिका में `rk.config.json` मौजूद है।

### MCP उपकरण

**ज्ञान और सिंक्रोनाइज़ेशन:**
`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood`

**ऑडिट:**
`audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

**बिल्ड-स्वास्थ्य** (केवल डेटाबेस से पढ़ें, नेटवर्क रीफ्रेश नहीं):
`health_feed` `health_doctor` `health_portfolio`

**परिचालन स्वच्छता:**
`db_fsck` `repo_diff` `ops_runs`

**लाइफसाइकिल और प्रकाशन:**
`archive_repo` `delete_repo` `repo_versions`

**डॉगफ़ूड और ऑडिट-ड्रिल:**
`suggest_dogfood` `audit_failing`

## ऑडिट ढांचा

ऑडिट प्रणाली में 80 नियंत्रणों के साथ 19 डोमेन शामिल हैं:

| डोमेन | नियंत्रण |
|--------|----------|
| इन्वेंटरी | रिपॉजिटरी मेटाडेटा, स्वामित्व, वर्गीकरण |
| कोड_गुणवत्ता | लिंटिंग, फ़ॉर्मेटिंग, जटिलता |
| सुरक्षा_एसएएसटी | स्थैतिक विश्लेषण, इंजेक्शन, प्रमाणीकरण |
| निर्भरताएं_एससीए | भेद्यता स्कैनिंग, मुद्रा |
| लाइसेंस | लाइसेंस अनुपालन, संगतता |
| गुप्त जानकारी | गुप्त जानकारी का पता लगाना, रोटेशन |
| कॉन्फ़िगरेशन_आईएसी | इंफ्रास्ट्रक्चर-एज़-कोड स्वच्छता |
| कंटेनर | छवि सुरक्षा, स्कैनिंग |
| रनटाइम | त्रुटि प्रबंधन, लचीलापन |
| प्रदर्शन | प्रोफाइलिंग, अनुकूलन |
| अवलोकनीयता | लॉगिंग, ट्रेसिंग, मेट्रिक्स |
| परीक्षण | कवरेज, प्रकार, सीआई एकीकरण |
| सीआईसीडी | पाइपलाइन सुरक्षा, गेट्स |
| तैनाती | रिलीज़ प्रक्रिया, रोलबैक |
| बैकअप_डीआर | बैकअप योजनाएं, पुनर्प्राप्ति |
| निगरानी | अलर्टिंग, अपटाइम |
| अनुपालन_गोपनीयता | डेटा प्रबंधन, जीडीपीआर |
| आपूर्ति श्रृंखला | एसबीओएम, उत्पत्ति |
| एकीकरण | एपीआई अनुबंध, संस्करण |

प्रत्येक ऑडिट रन संरचित प्रमाण उत्पन्न करता है: नियंत्रण परिणाम (पास/विफल/चेतावनी/लागू नहीं), गंभीरता और उपचारात्मक कार्रवाई के साथ निष्कर्ष, और एकत्रित मेट्रिक्स। मुद्रा स्वचालित रूप से प्राप्त की जाती है: **स्वस्थ**, **ध्यान देने की आवश्यकता**, या **महत्वपूर्ण**।

## मल्टी-एजेंट ऑर्केस्ट्रेशन: द क्लाउड गेम्स

रिपो-नॉलेज में बड़े पोर्टफोलियो में समानांतर मल्टी-क्लाउड ऑपरेशनों के लिए टेम्पलेट शामिल हैं। क्लाउड गेम्स एक साझा कार्यसूची के माध्यम से कई एआई एजेंटों का समन्वय करते हैं:

1. **ऑडिट पास** - प्रत्येक एजेंट कार्यसूची से रिपॉजिटरी का दावा करता है, 80-नियंत्रण ऑडिट चलाता है, और संरचित परिणाम प्रस्तुत करता है।
2. **समृद्धि पास** - एजेंट थीसिस, आर्किटेक्चर नोट्स और संबंध मानचित्रण जोड़ते हैं।
3. **उपचारात्मक पास** - एजेंट 8-चरणीय स्कोर किए गए वर्कफ़्लो का उपयोग करके निष्कर्षों को ठीक करते हैं।

पूर्ण प्लेबुक के लिए [`templates/claude-games/`](templates/claude-games/) देखें।

## डेटा मॉडल

```
repos
 +-- tech (language, framework, shape, runtime)
 +-- notes (thesis, architecture, warning, convention, ...)
 +-- docs (README, CHANGELOG, indexed content)
 +-- facts (dependencies, config keys, endpoints)
 +-- relationships (depends_on, related_to, supersedes, ...)
 +-- audit_runs
      +-- audit_control_results (per-control pass/fail)
      +-- audit_findings (title, severity, remediation)
      +-- audit_metrics (pass_rate, coverage, counts)
```

सभी डेटा एक एकल SQLite डेटाबेस में रहते हैं जिसमें दस्तावेज़ों, नोट्स और रिपॉजिटरी विवरणों पर FTS5 पूर्ण-पाठ खोज होती है।

## कॉन्फ़िगरेशन

अपने कार्यक्षेत्र की रूट निर्देशिका में `rk.config.json` बनाएं (या `rk init` चलाएं):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

सभी सेटिंग्स `rk.config.json` से आती हैं (जिसे `rk init` द्वारा बनाया गया है)। एमसीपी सर्वर कार्यशील निर्देशिका से भी कॉन्फ़िगरेशन पढ़ता है।

## लाइसेंस

[एमआईटी](LICENSE)

---

<a href="https://mcp-tool-shop.github.io/">एमसीपी टूल शॉप</a> द्वारा निर्मित
