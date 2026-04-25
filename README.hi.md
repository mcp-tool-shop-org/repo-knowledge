<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/repo-knowledge/readme.png" alt="repo-knowledge" width="400" />
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

## क्यों?

पैकेज रजिस्ट्री और GitHub एपीआई आपको बताते हैं कि एक रिपॉजिटरी (repo) क्या है। वे आपको यह नहीं बताते कि वह किस उद्देश्य के लिए है, यह आपके अन्य रिपॉजिटरी से कैसे संबंधित है, इसका आर्किटेक्चरल सिद्धांत क्या है, या क्या यह आपके अंतिम सुरक्षा ऑडिट में पास हुआ है। "रिपो-नॉलेज" इस कमी को पूरा करता है: यह एक एकल स्थानीय डेटाबेस है जो सभी रिपॉजिटरी के लिए सिद्धांतों, आर्किटेक्चर, ऑडिट के प्रमाण, संबंधों और पूर्ण-पाठ खोज को संग्रहीत करता है।

## स्थापित करें।

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**आवश्यकताएं:**
- नोड.जेएस 20 या उससे ऊपर का संस्करण
- गिटहब के साथ सिंक करने के लिए `gh` सीएलआई (प्रमाणीकृत)
- `better-sqlite3` के लिए सी/सी++ बिल्ड टूल्स, या समर्थित प्लेटफॉर्मों पर, पहले से तैयार बाइनरी फ़ाइलें स्वचालित रूप से उपयोग की जाएंगी।

## सुरक्षा मॉडल।

**उपयोग किए गए डेटा स्रोत:** स्थानीय SQLite डेटाबेस, और GitHub API से प्राप्त मेटाडेटा (जैसे कि रिपॉजिटरी के नाम, विवरण, विषय, और स्टार की संख्या - लेकिन इसमें स्रोत कोड की सामग्री शामिल नहीं है)। यह जानकारी `gh` कमांड-लाइन इंटरफेस के माध्यम से प्राप्त की गई है।

**कोई भी डेटा एक्सेस नहीं किया गया:** GitHub से कोई भी स्रोत कोड नहीं पढ़ा गया है, कोई भी क्रेडेंशियल संग्रहीत नहीं किया गया है, और कोई भी डेटा किसी बाहरी सेवा को नहीं भेजा गया है।

**अनुमतियाँ:** GitHub के साथ सिंक करने के लिए, `gh` कमांड-लाइन इंटरफेस (CLI) को प्रमाणित (ऑथेंटिकेटेड) होना आवश्यक है; सारा डेटा स्थानीय रूप से ही संग्रहीत रहता है।

कोई डेटा संग्रह नहीं, कोई विश्लेषण नहीं, और यह उपकरण किसी भी तरह से बाहरी सर्वर से कनेक्ट नहीं होगा।

## शुरुआत कैसे करें।

```bash
# Initialize workspace — creates config, database, seeds audit controls
rk init

# Sync repos from your GitHub org
rk sync --owners my-org

# Inspect a specific repo
rk show my-org/my-repo

# Search across everything
rk find "authentication middleware"

# Seed the 80-control audit framework
rk audit seed-controls
```

## सीएलआई संदर्भ।

### मुख्य आदेश।

| आदेश। | विवरण। |
|---------|-------------|
| `rk init` | कॉन्फ़िगरेशन, डेटाबेस को आरंभ करें और ऑडिट नियंत्रणों को स्थापित करें। |
| `rk sync` | पूरी तरह से सिंक्रोनाइज़ेशन: GitHub संगठन + स्थानीय रिपॉजिटरी + फुल-टेक्स्ट सर्च इंडेक्स। |
| `rk scan <path>` | एक स्थानीय रिपॉजिटरी फ़ोल्डर को स्कैन करें। |
| `rk show <slug>` | अपने रिपॉजिटरी (कोड भंडार) के बारे में पूरी जानकारी प्रदर्शित करें और इसकी सुरक्षा स्थिति का मूल्यांकन करें। |
| `rk list` | सभी रिपॉजिटरी की सूची दिखाएं (जिन्हें स्थिति, भाषा और संरचना के आधार पर फ़िल्टर किया जा सकता है)। |
| `rk find <query>` | सभी अनुक्रमित सामग्री में पूर्ण पाठ खोज करने की क्षमता। |
| `rk related <slug>` | दिए गए रिपॉजिटरी से संबंधित अन्य रिपॉजिटरीज़ दिखाएं। |
| `rk note <slug>` | एक टाइप किया हुआ नोट (थीसिस, आर्किटेक्चर, चेतावनी, आदि) जोड़ें। |
| `rk relate <from> <type> <to>` | रिपोज़ के बीच के संबंधों का रिकॉर्ड बनाएं। |
| `rk stats` | डेटाबेस के आँकड़ों को प्रदर्शित करें। |
| `rk reindex` | एफटीएस इंडेक्स को फिर से बनाएं। |

### ऑडिट कमांड्स।

| आदेश। | विवरण। |
|---------|-------------|
| `rk audit seed-controls` | 80-कंट्रोल मानक कैटलॉग को अपडेट करें या उसमें नई जानकारी जोड़ें। |
| `rk audit import <dir>` | JSON अनुबंध फ़ाइलों से आयातित डेटा का ऑडिट परिणाम प्राप्त करें। |
| `rk audit posture [slug]` | एक विशिष्ट रिपॉजिटरी या पूरे पोर्टफोलियो के लिए ऑडिट की स्थिति प्रदर्शित करें। |
| `rk audit findings` | पोर्टफोलियो में खुली हुई सभी समस्याओं की सूची प्रदर्शित करें। |
| `rk audit controls` | डोमेन के अनुसार, मानक नियंत्रणों की सूची बनाएं। |
| `rk audit unaudited` | उन रिपॉजिटरी की सूची बनाएं जिनमें अभी तक कोई ऑडिट नहीं किया गया है। |
| `rk audit failing <domain>` | उन रिपॉजिटरीज़ की सूची जो किसी विशेष ऑडिट डोमेन में विफल हो रही हैं। |

## एमसीपी सर्वर।

एमसीपी सर्वर, कृत्रिम बुद्धिमत्ता (एआई) से युक्त कार्यप्रवाहों के लिए 20 उपकरण प्रदान करता है। इसे अपने एमसीपी क्लाइंट कॉन्फ़िगरेशन में जोड़ें:

**claude_desktop_config.json:**
```json
{
  "mcpServers": {
    "repo-knowledge": {
      "command": "node",
      "args": ["node_modules/@mcptoolshop/repo-knowledge/dist/mcp/server.js"],
      "env": {
        "RK_DB_PATH": "/path/to/knowledge.db"
      }
    }
  }
}
```

**.claude.json (परियोजना-विशिष्ट):**
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

### MCP उपकरण।

`get_repo` - रिपॉजिटरी प्राप्त करें
`find_repos` - रिपॉजिटरी खोजें
`search_repos` - रिपॉजिटरी खोजें
`related_repos` - संबंधित रिपॉजिटरी
`repos_by_stack` - स्टैक के अनुसार रिपॉजिटरी
`repos_needing_work` - जिन रिपॉजिटरी पर काम की आवश्यकता है
`repo_summary` - रिपॉजिटरी का सारांश
`add_repo_note` - रिपॉजिटरी पर टिप्पणी जोड़ें
`add_relationship` - संबंध जोड़ें
`knowledge_stats` - ज्ञान के आंकड़े
`sync_repos` - रिपॉजिटरी को सिंक्रोनाइज़ करें
`audit_posture` - ऑडिट की स्थिति
`audit_portfolio` - ऑडिट पोर्टफोलियो
`audit_findings` - ऑडिट के निष्कर्ष
`audit_detail` - ऑडिट विवरण
`audit_submit` - ऑडिट सबमिट करें
`audit_controls_list` - ऑडिट नियंत्रणों की सूची
`audit_unaudited` - बिना ऑडिट किए गए

## लेखा परीक्षा ढांचा।

ऑडिट प्रणाली में 19 क्षेत्र शामिल हैं, जिनमें 80 नियंत्रण उपाय लागू किए गए हैं।

| डोमेन। | नियंत्रण। |
|--------|----------|
| इन्वेंटरी (मालसूची) | रिपोर्ट मेटाडेटा, स्वामित्व, वर्गीकरण। |
| कोड की गुणवत्ता। | लिंटिंग, फ़ॉर्मेटिंग, जटिलता। |
| सुरक्षा, सस्ता। | स्थैतिक विश्लेषण, इंजेक्शन, प्रमाणीकरण। |
| निर्भरताएँ (सुरक्षा भेद्यता विश्लेषण) | भेद्यता स्कैनिंग, मुद्रा। |
| लाइसेंस। | लाइसेंस का अनुपालन, अनुकूलता। |
| रहस्य। | गुप्त जानकारी का पता लगाना, घुमाव। |
| config_iac: यह एक कॉन्फ़िगरेशन फ़ाइल या निर्देशिका का नाम है, जो संभवतः इंफ्रास्ट्रक्चर-एज़-कोड (Infrastructure-as-Code) से संबंधित है। | बुनियादी ढांचे को कोड के रूप में प्रबंधित करने की स्वच्छता। |
| कंटेनर। | छवि सुरक्षा, स्कैनिंग। |
| रनटाइम | त्रुटि प्रबंधन, लचीलापन। |
| प्रदर्शन | प्रोफाइलिंग, अनुकूलन। |
| अवलोकनीयता | लॉगिंग, ट्रेसिंग, मेट्रिक्स |
| परीक्षण | कवरेज, प्रकार, सीआई एकीकरण |
| सीआईसीडी | पाइपलाइन सुरक्षा, गेट्स |
| तैनाती | रिलीज़ प्रक्रिया, रोलबैक |
| बैकअप_डीआर | बैकअप योजनाएं, रिकवरी |
| निगरानी | अलर्टिंग, अपटाइम |
| अनुपालन_गोपनीयता | डेटा प्रबंधन, जीडीपीआर |
| आपूर्ति श्रृंखला | एसबीओएम, उत्पत्ति |
| एकीकरण | एपीआई अनुबंध, संस्करण |

प्रत्येक ऑडिट रन संरचित प्रमाण उत्पन्न करता है: नियंत्रण परिणाम (पास/फेल/चेतावनी/लागू नहीं), गंभीरता और निवारण के साथ निष्कर्ष, और एकत्रित मेट्रिक्स। स्थिति स्वचालित रूप से निर्धारित की जाती है: **स्वस्थ**, **ध्यान देने की आवश्यकता**, या **गंभीर**।

## मल्टी-एजेंट ऑर्केस्ट्रेशन: द क्लाउड गेम्स

रिपो-नॉलेज में बड़े पोर्टफोलियो में समानांतर मल्टी-क्लाउड ऑपरेशंस के लिए टेम्पलेट शामिल हैं। क्लाउड गेम्स एक साझा कार्य सूची के माध्यम से कई एआई एजेंटों का समन्वय करते हैं:

1. **ऑडिट पास** — प्रत्येक एजेंट कार्य सूची से रिपोस का दावा करता है, 80 नियंत्रणों का ऑडिट चलाता है, और संरचित परिणाम जमा करता है।
2. **एन्हांसमेंट पास** — एजेंट थीसिस, आर्किटेक्चर नोट्स और संबंध मैपिंग जोड़ते हैं।
3. **रिमेडिएशन पास** — एजेंट एक स्कोर किए गए 8-चरणीय वर्कफ़्लो का उपयोग करके निष्कर्षों को ठीक करते हैं।

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

सभी डेटा एक ही SQLite डेटाबेस में संग्रहीत है, जिसमें दस्तावेज़ों, नोट्स और रिपो विवरणों में FTS5 फुल-टेक्स्ट सर्च उपलब्ध है।

## कॉन्फ़िगरेशन

अपने वर्कस्पेस रूट में `rk.config.json` बनाएं (या `rk init` चलाएं):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

पर्यावरण चर: `RK_DB_PATH`, `RK_OWNERS`, `RK_LOCAL_DIRS`.

## लाइसेंस

[एमआईटी](LICENSE)

---

<a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> द्वारा निर्मित।
