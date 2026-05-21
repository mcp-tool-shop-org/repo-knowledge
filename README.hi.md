<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/repo-knowledge/readme.png" alt="repo-knowledge" width="800" />
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

पैकेज रजिस्ट्री और GitHub एपीआई आपको बताते हैं कि एक रिपॉजिटरी क्या है। वे यह नहीं बताते कि यह किसके लिए है, यह आपके अन्य रिपॉजिटरी से कैसे संबंधित है, इसका आर्किटेक्चरल सिद्धांत क्या है, या क्या यह आपके अंतिम सुरक्षा ऑडिट में पास हुआ है। 'रिपो-नॉलेज' इस अंतर को पूरा करता है: एक एकल स्थानीय डेटाबेस जो थीसिस, आर्किटेक्चर, ऑडिट साक्ष्य, संबंधों और सभी के लिए पूर्ण-पाठ खोज को संग्रहीत करता है।

## इंस्टॉल करें

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**आवश्यकताएं:**
- Node.js 20+
- GitHub सिंक के लिए `gh` CLI (प्रमाणित)
- `better-sqlite3` के लिए C/C++ बिल्ड टूल, या समर्थित प्लेटफार्मों पर प्रीबिल्ट बाइनरी का उपयोग स्वचालित रूप से किया जाएगा।

## सुरक्षा मॉडल

**डेटा जो उपयोग किया जाता है:** स्थानीय SQLite डेटाबेस, `gh` CLI के माध्यम से GitHub एपीआई मेटाडेटा (रिपॉजिटरी नाम, विवरण, विषय, सितारे - कोई स्रोत कोड सामग्री नहीं)।

**डेटा जो उपयोग नहीं किया जाता:** GitHub से कोई स्रोत कोड नहीं पढ़ा जाता है, कोई क्रेडेंशियल संग्रहीत नहीं किए जाते हैं, कोई डेटा बाहरी सेवाओं को नहीं भेजा जाता है।

**अनुमतियां:** GitHub सिंक के लिए `gh` CLI की आवश्यकता है (प्रमाणित); सारा डेटा स्थानीय रहता है।

**कोई टेलीमेट्री नहीं, कोई विश्लेषण नहीं, कोई 'फोन-होम' नहीं।**

## शुरुआत कैसे करें

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
| `rk init` | कॉन्फ़िगरेशन, डेटाबेस को इनिशियलाइज़ करें और ऑडिट नियंत्रणों को सेट करें। |
| `rk sync` | पूर्ण सिंक: GitHub संगठन + स्थानीय रिपॉजिटरी + FTS इंडेक्स। |
| `rk scan <path>` | एक एकल स्थानीय रिपॉजिटरी निर्देशिका को स्कैन करें। |
| `rk show <slug>` | ऑडिट स्थिति के साथ पूर्ण रिपॉजिटरी जानकारी दिखाएं। |
| `rk list` | सभी रिपॉजिटरी की सूची दिखाएं (स्थिति, भाषा, आकार के आधार पर फ़िल्टर किया जा सकता है)। |
| `rk find <query>` | सभी अनुक्रमित सामग्री के लिए पूर्ण-पाठ खोज। |
| `rk related <slug>` | किसी दिए गए रिपॉजिटरी से संबंधित रिपॉजिटरी दिखाएं। |
| `rk note <slug>` | `--type` और `--content` (वैकल्पिक `--title`) के साथ एक टाइप किया गया नोट (थीसिस, आर्किटेक्चर, चेतावनी, आदि) जोड़ें। |
| `rk relate <from> <type> <to>` | रिपॉजिटरी के बीच एक संबंध रिकॉर्ड करें (वैकल्पिक `--note`)। |
| `rk stats` | डेटाबेस आँकड़े दिखाएं। |
| `rk reindex` | FTS इंडेक्स को फिर से बनाएं। |
| `rk sync-dogfood` | `dogfood-lab/testing-os` से 'dogfood' साक्ष्य को रिपॉजिटरी तथ्यों में सिंक करें। |
| `rk suggest-dogfood --repo <slug>` | किसी रिपॉजिटरी या सतह के लिए ज्ञात 'dogfood' निष्कर्षों का सुझाव दें। |

### लाइफसाइकिल कमांड (v2.0.0)

| कमांड | विवरण |
|---------|-------------|
| `rk delete <slug> [--yes]` | एक रिपॉजिटरी और सभी चाइल्ड पंक्तियों को कैस्केड-डिलीट करें। |
| `rk archive <slug> [--reason <text>]` | `lifecycle_status` को `archived` पर सेट करें (नोट/निष्कर्षों को संरक्षित करता है)। |
| `rk verify-local [--rig <id>] [--strict]` | जांचें कि `local_path` मौजूद है या नहीं; `repo_local_paths` को अपडेट करता है। |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | वर्तमान रिग को रजिस्टर करें। |
| `rk prune [--dry-run] [--apply] [--days <N>]` | N दिनों (डिफ़ॉल्ट 30) से अधिक समय से संग्रहीत रिपॉजिटरी को हार्ड-डिलीट करें। |

### पब्लिश-स्टेट कमांड (v2.0.0)

| कमांड | विवरण |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | क्रॉस-चैनल प्रकाशित-संस्करण डैशबोर्ड (npm/pypi/github_release)। |
| `rk drift <slug> [--strict]` | सत्य-स्रोत संस्करण की तुलना नवीनतम रजिस्ट्री से करें। |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | मैनुअल बाइंडिंग सेटर। |

### स्वास्थ्य कमांड (v2.0.0 - अनुसंधान-आधारित)

| कमांड | विवरण |
|---------|-------------|
| `rk health` (डिफ़ॉल्ट = फ़ीड) | फ़ीड बदलें: अंतिम सिंक के बाद के अंतर, KEV इंटरसेक्शन, CI स्ट्राइक ब्रेक, एक्शन-पिन बहाव। |
| `rk health doctor <slug>` | एकल-रिपॉजिटरी गहन विश्लेषण (डिप ऑडिट, वर्कफ़्लो क्रियाएं, CI सिग्नल, टूलचेन)। |
| `rk health table [--json` | `--text]` | पोर्टफोलियो स्वास्थ्य तालिका; JSON लोड-बेयरिंग अनुबंध है। |

### ऑपरेशनल कमांड (v2.0.0)

| कमांड | विवरण |
|---------|-------------|
| `rk fsck [--strict] [--json]` | DB अखंडता जांच; `db_health_runs` में ऑडिट पंक्ति लिखता है। |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | एक रिपॉजिटरी के लिए प्रविष्टि परिवर्तन इतिहास। |
| `rk runs [--db-health` | `--sync] [--limit <N>] [--json]` | हाल के `db_health_runs` / `sync_runs` प्रविष्टियों की सूची। |
| `rk owners list` | कॉन्फ़िगर किए गए GitHub मालिकों की सूची। |
| `rk owners add <owner>` | `rk.config.json` मालिकों में जोड़ें। |
| `rk owners remove <owner>` | `rk.config.json` मालिकों से हटाएं। |

### ऑडिट कमांड

| कमांड | विवरण |
|---------|-------------|
| `rk audit seed-controls` | 80-नियंत्रण वाले कैनोनिकल कैटलॉग को सीड/अपडेट करें। |
| `rk audit import <dir>` | JSON अनुबंध फ़ाइलों से ऑडिट परिणामों का आयात करें। |
| `rk audit posture [slug]` | एक रिपॉजिटरी या पूरे पोर्टफोलियो के लिए ऑडिट स्थिति दिखाएं। |
| `rk audit findings` | पूरे पोर्टफोलियो में खुली समस्याओं की सूची बनाएं। |
| `rk audit controls` | डोमेन के अनुसार मानक नियंत्रणों की सूची बनाएं। |
| `rk audit unaudited` | उन रिपॉजिटरी की सूची बनाएं जिनमें कोई ऑडिट रन नहीं हुआ है। |
| `rk audit failing <domain>` | किसी विशिष्ट ऑडिट डोमेन में विफल होने वाली रिपॉजिटरी की सूची बनाएं। |

### गेम्स कमांड

| कमांड | विवरण |
|---------|-------------|
| `rk games score <worklist>` | REMEDIATION-WORKLIST.md को स्कोर करें और लीडरबोर्ड दिखाएं। |

## MCP सर्वर

MCP सर्वर AI-एकीकृत वर्कफ़्लो के लिए 19 उपकरण प्रदान करता है। इसे अपने MCP क्लाइंट कॉन्फ़िगरेशन में जोड़ें:

**क्लाउड कोड (प्रोजेक्ट-स्कोप वाला `.claude.json`):**
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

**क्लाउड डेस्कटॉप (`claude_desktop_config.json`):**
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

सर्वर स्टार्टअप पर वर्किंग डायरेक्टरी से `rk.config.json` पढ़ता है। सुनिश्चित करें कि सर्वर जिस डायरेक्टरी में चल रहा है, उसमें `rk.config.json` मौजूद है।

### MCP उपकरण

`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood` `audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

## ऑडिट ढांचा

ऑडिट प्रणाली 19 डोमेन में 80 नियंत्रणों को कवर करती है:

| डोमेन | नियंत्रण |
|--------|----------|
| इन्वेंटरी | रिपॉजिटरी मेटाडेटा, स्वामित्व, वर्गीकरण |
| कोड गुणवत्ता | लिंटिंग, फॉर्मेटिंग, जटिलता |
| सुरक्षा-SAST | स्थैतिक विश्लेषण, इंजेक्शन, प्रमाणीकरण |
| निर्भरता-SCA | भेद्यता स्कैनिंग, मुद्रा |
| लाइसेंस | लाइसेंस अनुपालन, अनुकूलता |
| गुप्त जानकारी | गुप्त जानकारी का पता लगाना, रोटेशन |
| कॉन्फ़िग-IAC | इंफ्रास्ट्रक्चर-एज़-कोड स्वच्छता |
| कंटेनर | इमेज सुरक्षा, स्कैनिंग |
| रनटाइम | त्रुटि प्रबंधन, लचीलापन |
| प्रदर्शन | प्रोफाइलिंग, अनुकूलन |
| अवलोकनशीलता | लॉगिंग, ट्रेसिंग, मेट्रिक्स |
| परीक्षण | कवरेज, प्रकार, CI एकीकरण |
| CI/CD | पाइपलाइन सुरक्षा, गेट |
| तैनाती | रिलीज़ प्रक्रिया, रोलबैक |
| बैकअप-DR | बैकअप योजनाएं, रिकवरी |
| निगरानी | अलर्टिंग, अपटाइम |
| अनुपालन-गोपनीयता | डेटा हैंडलिंग, जीडीपीआर |
| सप्लाई चेन | SBOM, उत्पत्ति |
| एकीकरण | API अनुबंध, संस्करण |

प्रत्येक ऑडिट रन संरचित प्रमाण उत्पन्न करता है: नियंत्रण परिणाम (पास/विफल/चेतावनी/लागू नहीं), गंभीरता और निवारण के साथ खोज, और एकत्रित मेट्रिक्स। स्थिति स्वचालित रूप से प्राप्त होती है: **स्वस्थ**, **ध्यान देने योग्य**, या **गंभीर**।

## मल्टी-एजेंट ऑर्केस्ट्रेशन: क्लाउड गेम्स

repo-knowledge में बड़े पोर्टफोलियो में समानांतर मल्टी-क्लाउड ऑपरेशंस के लिए टेम्पलेट शामिल हैं। क्लाउड गेम्स एक साझा कार्य सूची के माध्यम से कई AI एजेंटों का समन्वय करते हैं:

1. **ऑडिट पास** — प्रत्येक एजेंट कार्य सूची से रिपॉजिटरी लेता है, 80 नियंत्रणों का ऑडिट चलाता है, और संरचित परिणाम जमा करता है।
2. **एन्हांसमेंट पास** — एजेंट थीसिस, आर्किटेक्चर नोट्स और रिलेशनशिप मैपिंग जोड़ते हैं।
3. **रिमेडिएशन पास** — एजेंट एक स्कोर किए गए 8-चरणीय वर्कफ़्लो का उपयोग करके समस्याओं को ठीक करते हैं।

पूरे प्लेबुक के लिए [`templates/claude-games/`](templates/claude-games/) देखें।

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

सभी डेटा एक ही SQLite डेटाबेस में संग्रहीत है, जिसमें दस्तावेज़ों, नोट्स और रिपॉजिटरी विवरणों में FTS5 पूर्ण-पाठ खोज शामिल है।

## कॉन्फ़िगरेशन

अपने कार्यक्षेत्र की मुख्य निर्देशिका में `rk.config.json` फ़ाइल बनाएं (या `rk init` कमांड चलाएं):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

सभी सेटिंग्स `rk.config.json` फ़ाइल से ली जाती हैं (जिसे `rk init` कमांड द्वारा बनाया गया है)। एमसीपी सर्वर भी कार्य निर्देशिका से कॉन्फ़िगरेशन फ़ाइल पढ़ता है।

## लाइसेंस

[एमआईटी](LICENSE)

---

यह <a href="https://mcp-tool-shop.github.io/">एमसीपी टूल शॉप</a> द्वारा बनाया गया है।
