# Epstein Investigation -- Web Research Scratchpad
## Research Date: 2026-03-18

---

## 1. DOJ File Releases (2025-2026) -- New Names & Flight Logs

### VERIFIED FACTS
- **2025-11-18**: Epstein Files Transparency Act (H.R.4405) passed, requiring DOJ disclosure
- **2025-12-19**: DOJ released first batch (heavily redacted) per statutory deadline
- **2026-01-30**: DOJ released 3+ million additional pages, 180,000 images, 2,000+ videos
- **Total release**: ~3.5 million pages out of 6 million potentially responsive pages identified
- **2026-02-15**: DOJ sent Congress a list of "politically exposed persons" appearing in the files
- List includes: Donald Trump, Bill Clinton, Steve Bannon, Kathy Ruemmler, Les Wexner -- but appearance does NOT imply criminal conduct
- List also includes deceased cultural figures (Princess Diana, Elvis Presley, Michael Jackson) demonstrating breadth of Epstein's name-dropping/records
- **No one on the list besides Epstein and Maxwell has been charged**

### NEWLY IDENTIFIED NAMES (2026)
- **Sultan Ahmed bin Sulayem** (Emirati businessman): Rep. Ro Khanna identified him (2026-02-10) as one of six names previously redacted from the files
- **Les Wexner**: Name was unredacted from FBI co-conspirator documents after pressure from Rep. Thomas Massie
- **Navy Secretary John Phelan**: Found on two flight manifests from 2006 (NY to London, Feb 27; return Mar 3, 2006)

### VICTIM PRIVACY ISSUE
- Attorneys for victims reported that the Jan 30 release contained **unredacted images and identities of multiple survivors** -- a serious breach

### KNOWLEDGE GRAPH NODES/EDGES TO ADD
- Node: `EpsteinFilesTransparencyAct` (legislation, passed 2025-11)
- Node: `SultanAhmedBinSulayem` (Person, Emirati businessman)
- Node: `JohnPhelan` (Person, Navy Secretary)
- Edge: `Phelan --[FLEW_WITH]--> Epstein` (date: 2006-02-27, route: NY-London)
- Edge: `Phelan --[FLEW_WITH]--> Epstein` (date: 2006-03-03, route: London-NY)
- Edge: `Wexner --[LISTED_AS]--> FBI_CoConspirator_Document`
- Edge: `DOJ --[RELEASED]--> EpsteinFiles` (date: 2026-01-30, pages: 3000000+)

### SOURCES
- [CBS News: Massive trove of Epstein files released](https://www.cbsnews.com/live-updates/epstein-files-released-doj-2026/)
- [DOJ: 3.5 Million Responsive Pages](https://www.justice.gov/opa/pr/department-justice-publishes-35-million-responsive-pages-compliance-epstein-files)
- [CNN: DOJ releases millions of pages](https://www.cnn.com/politics/live-news/epstein-files-release-doj-01-30-26)
- [CNN: DOJ lists hundreds of prominent people](https://www.cnn.com/2026/02/15/politics/doj-epstein-files-prominent-people)
- [Al Jazeera: Visual guide to Epstein files](https://www.aljazeera.com/news/2026/2/10/struggling-to-navigate-the-epstein-files-here-is-a-visual-guide)
- [DOJ Epstein Library](https://www.justice.gov/epstein)
- [Al Jazeera: 3 million new Epstein files](https://www.aljazeera.com/news/2026/1/30/us-department-of-justice-releases-three-million-new-epstein-documents)

---

## 2. Ghislaine Maxwell -- Prison Interview & Cooperation

### VERIFIED FACTS
- **2025-07-24/25**: Deputy AG Todd Blanche interviewed Maxwell at prison (transcripts released by DOJ with redactions)
- Maxwell stated: "I actually never saw the president in any type of massage setting"
- **2025-08-01**: Maxwell transferred from FCI Tallahassee to minimum-security Federal Prison Camp Bryan (Bryan, TX)
- Transfer reason per Deputy AG Blanche: "numerous threats against her life"
- **2025-08-14**: Democrats raised "substantial" witness tampering concerns about the transfer
- **2026-02-09**: Maxwell questioned by House Oversight Committee via video conference from FPC Bryan
- **Maxwell invoked the Fifth Amendment and refused to answer questions**
- **2026-02-10**: Maxwell's attorney David Oscar Markus stated she is "prepared to speak fully and honestly if granted clemency by President Trump"
- AG Bondi stated Maxwell "will hopefully die in prison"

### UNVERIFIED / DISPUTED
- Snopes investigated body double conspiracy theory (2026-02-25) -- debunked

### KNOWLEDGE GRAPH NODES/EDGES TO ADD
- Node: `ToddBlanche` (Person, Deputy AG)
- Edge: `Blanche --[INTERVIEWED]--> Maxwell` (date: 2025-07-24, location: prison)
- Edge: `Maxwell --[TRANSFERRED_TO]--> FPC_Bryan` (date: 2025-08-01)
- Edge: `Maxwell --[INVOKED_5TH]--> HouseOversightCommittee` (date: 2026-02-09)
- Edge: `Maxwell --[OFFERED_COOPERATION_IF]--> ClemencyFromTrump` (date: 2026-02-10)
- Node: `DavidOscarMarkus` (Person, Maxwell's attorney)

### SOURCES
- [Deadline: Maxwell Prison Interview](https://deadline.com/2025/08/ghislaine-maxwell-interview-release-media-1236495730/)
- [DOJ: Maxwell Interview Transcript](https://www.justice.gov/storage/audio-files/Interview%20Transcript/Interview%20Transcript%20-%20Maxwell%202025.07.24%20(Redacted).pdf)
- [NPR: Maxwell appeals for clemency](https://www.npr.org/2026/02/10/g-s1-109413/maxwell-appeals-for-clemency)
- [Fortune: Maxwell transferred to minimum-security](https://fortune.com/2025/12/21/ghislaine-maxwell-transfer-minimum-security-prison-threats-epstein-files/)
- [ABC News: Bondi says Maxwell will die in prison](https://abcnews.com/Politics/bondi-ghislaine-maxwell-die-prison/story?id=130077267)
- [Axios: Maxwell transfer raises witness tampering concerns](https://www.axios.com/2025/08/14/ghislaine-maxwell-prison-transfer-democrats)

---

## 3. USVI Attorney General Investigation

### VERIFIED FACTS
- **2020**: USVI AG Denise N. George filed sex trafficking and fraud action against Epstein estate
- George was subsequently **fired** by USVI government
- **2022-12**: Settlement reached -- defendants paid **$105 million** to USVI
- **2025-11-18**: House Oversight Committee sent letter to USVI AG Gordon C. Rhea seeking documents
- **2026-03-04**: House Oversight Committee voted 24-19 (bipartisan) to subpoena AG Pam Bondi
- **2026-03-17**: Bondi formally subpoenaed, ordered to appear for deposition on **April 14, 2026**
- Focus: "possible mismanagement of the federal government's investigation" into Epstein/Maxwell
- Accusations that DOJ has **concealed names** of powerful Epstein associates in document releases

### KNOWLEDGE GRAPH NODES/EDGES TO ADD
- Node: `DeniseGeorge` (Person, former USVI AG -- fired)
- Node: `GordonRhea` (Person, current USVI AG)
- Node: `PamBondi` (Person, US AG)
- Edge: `USVI --[SETTLED_WITH]--> EpsteinEstate` (amount: $105M, date: 2022-12)
- Edge: `HouseOversight --[SUBPOENAED]--> Bondi` (date: 2026-03-17, hearing: 2026-04-14)
- Edge: `HouseOversight --[INVESTIGATING]--> DOJ_EpsteinProbe`

### SOURCES
- [USVI DOJ: $105M Settlement](https://usvidoj.com/u-s-virgin-islands-attorney-general-settles-sex-trafficking-case-against-estate-of-jeffrey-epstein-and-co-defendants-for-over-105-million/)
- [House Oversight: Letter to USVI AG](https://oversight.house.gov/wp-content/uploads/2025/11/11.18.2025-Letter-to-the-AG-USVI.pdf)
- [CNN: House Oversight votes to subpoena Bondi](https://www.cnn.com/2026/03/04/politics/bondi-epstein-files-subpoena-oversight-committee)
- [Washington Post: Bondi subpoenaed](https://www.washingtonpost.com/politics/2026/03/17/epstein-files-bondi-subpoena/)
- [PBS: Fired AG](https://www.pbs.gov/newshour/nation/u-s-virgin-islands-fires-attorney-general-in-jeffrey-epstein-cases)
- [CNBC: Bondi subpoena for April 14](https://www.cnbc.com/2026/03/17/epstein-pam-bondi-trump-doj-subpoena.html)

---

## 4. Jean-Luc Brunel / MC2 Models / French Investigation

### VERIFIED FACTS
- Brunel founded **MC2 Model Management** with Epstein financing (~$1M in 2004)
- Brunel died by suicide in French jail cell in **February 2022** while awaiting trial on charges of raping children and trafficking women/girls to Epstein
- Initial French investigation (2019-2023) was **closed/dismissed** after Brunel's death
- **2026-02-14**: Bloomberg reported France opened new probes into Epstein links, revisiting Brunel case
- **2026-02-20**: French prosecutors **officially reopened** the probe into Epstein associates including Brunel
- Paris prosecutor's office set up a **dedicated investigation team** to analyze US DOJ file releases for links to French nationals
- In 2026 DOJ file release: Brunel listed in a 2019 document as one of the people **"the FBI once called co-conspirators"** of Epstein
- Brussels modelling agency also named in Epstein emails (new lead from file releases)

### KNOWLEDGE GRAPH NODES/EDGES TO ADD
- Node: `MC2ModelManagement` (Organization, modeling agency)
- Edge: `Epstein --[FUNDED]--> MC2ModelManagement` (amount: ~$1M, year: 2004)
- Edge: `Brunel --[FOUNDED]--> MC2ModelManagement`
- Edge: `Brunel --[DIED]--> FrenchPrison` (date: 2022-02, cause: suicide)
- Edge: `FrenchProsecutors --[REOPENED_INVESTIGATION]--> BrunelCase` (date: 2026-02-20)
- Edge: `FBI --[LISTED_AS_COCONSPIRATOR]--> Brunel` (document_date: 2019)
- Node: `BrusselsModellingAgency` (Organization, named in Epstein emails -- needs identification)

### SOURCES
- [Democracy Now: French Prosecutors Reopen Probe](https://www.democracynow.org/2026/2/20/headlines/french_prosecutors_reopen_probe_into_epstein_associates_including_model_scout_jean_luc_brunel)
- [Bloomberg: France Opens New Probes](https://www.bloomberg.com/news/articles/2026-02-14/epstein-files-prompt-france-to-open-new-probes-revisit-brunel)
- [France in English: Brunel Investigation Reopened](https://franceinenglish.com/p/french-prosecutors-reopen-jean-luc-brunel-investigation-amid-new-epstein-links)
- [Wikipedia: Jean-Luc Brunel](https://en.wikipedia.org/wiki/Jean-Luc_Brunel)
- [Belgian News Agency: Brussels modelling agency](https://www.belganewsagency.eu/brussels-modelling-agency-named-in-epstein-emails-manager-denies-link)

---

## 5. Victim Compensation Fund -- Totals

### VERIFIED FACTS

| Fund/Settlement | Amount | Recipients | Status |
|---|---|---|---|
| Epstein Estate Victims' Compensation Program | ~$121-125M | 136-150 claimants (of 220+ applicants; 92% accepted) | **Closed** |
| Epstein Estate additional settlement | $49M | Victims lawsuit | Completed |
| Epstein Estate 2026 settlement | $35M | New victims lawsuit | Preliminary approval Mar 2026; final hearing Sep 16, 2026 |
| JPMorgan Chase settlement | $290M | Jane Doe 1 class | Completed (2023) |
| Deutsche Bank settlement | $75M | Victims | Completed |
| USVI government settlement | $105M | USVI (not direct to victims) | Completed (2022) |

- **Combined victim compensation total: ~$500M+** (unprecedented in sex trafficking case)
- $35M estate settlement: Judge Arun Subramanian granted preliminary approval, called it "fair, reasonable and adequate"

### KNOWLEDGE GRAPH NODES/EDGES TO ADD
- Node: `VictimsCompensationFund` (amount: $125M, status: closed)
- Node: `JPMorganSettlement` (amount: $290M, date: 2023)
- Node: `DeutscheBankSettlement` (amount: $75M)
- Node: `EpsteinEstate2026Settlement` (amount: $35M, status: pending_final_approval)
- Edge: `JPMorgan --[SETTLED]--> EpsteinVictims` (amount: $290M)
- Edge: `DeutscheBank --[SETTLED]--> EpsteinVictims` (amount: $75M)
- Node: `JudgeArunSubramanian` (Person, judge)

### SOURCES
- [ABC News: Victims program shutting down with $121M](https://abcnews.com/US/jeffrey-epstein-victims-program-shutting-121-million-paid/story?id=79344412)
- [Al Jazeera: $125M as claims end](https://www.aljazeera.com/economy/2021/8/9/epstein-victims-fund-ends-claims-process-after-awarding-125m)
- [CNN: Epstein estate $35M settlement](https://www.cnn.com/2026/02/20/politics/epstein-estate-settlement-victims)
- [NPR: JPMorgan $290M settlement](https://www.npr.org/2023/06/12/1181675580/epstein-jane-doe-1-290-million-settlement-jpmorgan-chase)
- [OpenClassActions: $35M settlement details](https://openclassactions.com/news/epstein-estate-settlement-survivors.php)

---

## 6. Leslie Wexner -- Congressional Deposition (Feb 2026)

### VERIFIED FACTS
- **2026-02-18**: Wexner deposed at his New Albany, Ohio mansion for ~5 hours
- Questioned by Republican committee staff and five Democratic representatives
- **2026-02-19**: House Oversight Committee released video of the full deposition

#### Wexner's Key Claims:
- He was "duped by a world-class con man"
- He "completely and irrevocably cut ties with Epstein nearly twenty years ago" (i.e., ~2007) when he "learned that he was an abuser, a crook, and a liar"
- Denied knowing about Epstein's crimes or participating in abuse
- Did "nothing wrong"

#### Financial Relationship Details:
- **1987-2007**: Wexner retained Epstein as financial manager
- **1991-07**: Wexner granted Epstein **power of attorney** and made him trustee of Wexner Foundation
- Epstein was Wexner's primary (possibly only major) client
- Epstein used POA to make investments, do deals, purchase property, develop Wexner's New Albany estate
- **2007**: Wexner revoked POA, removed Epstein from bank accounts, fired him as financial adviser
- **2019**: Wexner stated Epstein "misappropriated vast sums of money" from him and his family
- Investigative memo from DOJ files: Wexner's attorneys told investigators in 2008 that Epstein had **repaid $100M** -- thought to be only a portion of what was stolen

#### Congressional Pushback:
- Rep. Robert Garcia (D-CA): "There is no single person that was more involved in providing Jeffrey Epstein with the financial support to commit his crimes than Les Wexner"
- Rep. Dave Min (D-CA): Wexner's claim of ignorance is "just not credible"
- Lawmakers questioned why he signed a birthday card to Epstein as "your friend Leslie"
- **Democrats formally accused Wexner of lying** about his Epstein ties
- Wexner's name appears **1,000+ times** in the Epstein files

#### Legal Status:
- Wexner has **never been charged with any crimes**

### KNOWLEDGE GRAPH NODES/EDGES TO ADD
- Edge: `Wexner --[GRANTED_POWER_OF_ATTORNEY]--> Epstein` (date: 1991-07)
- Edge: `Wexner --[EMPLOYED_AS_FINANCIAL_MANAGER]--> Epstein` (start: 1987, end: 2007)
- Edge: `Epstein --[TRUSTEE_OF]--> WexnerFoundation` (start: 1991)
- Edge: `Epstein --[REPAID]--> Wexner` (amount: $100M, date: ~2008, note: partial repayment of misappropriated funds)
- Edge: `Wexner --[DEPOSED_BY]--> HouseOversightCommittee` (date: 2026-02-18)
- Edge: `Wexner --[REVOKED_POA]--> Epstein` (date: 2007)
- Node: `RepRobertGarcia` (Person, D-CA)
- Node: `RepDaveMin` (Person, D-CA)

### SOURCES
- [PBS: Wexner's full deposition](https://www.pbs.org/newshour/nation/watch-les-wexners-full-deposition-to-house-democrats-on-the-epstein-files)
- [NBC News: Wexner tells lawmakers he was conned](https://www.nbcnews.com/politics/congress/billionaire-les-wexner-tells-lawmakers-was-conned-jeffrey-epstein-noth-rcna259573)
- [CBS News: Wexner duped by con man](https://www.cbsnews.com/news/les-wexner-jeffrey-epstein-house-testimony/)
- [Ohio Capital Journal: Democrats accuse Wexner of lying](https://ohiocapitaljournal.com/2026/02/20/after-deposition-u-s-house-democrats-accuse-les-wexner-of-lying-about-epstein-ties/)
- [Spectrum News: Examining Wexner's deposition](https://spectrumnews1.com/oh/columbus/news/2026/02/20/les-wexner-s-deposition-before-congress)
- [WOSU: House Oversight releases video](https://www.wosu.org/politics-government/2026-02-19/u-s-house-oversight-committee-releases-video-of-les-wexners-deposition-concerning-epstein)
- [PBS: Documents on Wexner-Epstein relationship](https://www.pbs.org/newshour/politics/billionaire-les-wexner-is-being-deposed-in-the-epstein-files-probe-heres-what-documents-show-about-their-relationship)
- [Al Jazeera: How Wexner enabled Epstein's rise](https://www.aljazeera.com/news/2026/2/19/les-wexner-how-the-billionaire-enabled-jeffrey-epsteins-rise)

---

## UPCOMING EVENTS TO TRACK
- **2026-04-14**: AG Pam Bondi subpoenaed deposition before House Oversight Committee
- **2026-09-16**: Final approval hearing for $35M Epstein estate victim settlement
- French prosecutors' dedicated investigation team -- ongoing analysis of DOJ files for French national links
- Maxwell clemency request -- pending (no indication Trump will grant)

## HIGH-PRIORITY GRAPH ADDITIONS SUMMARY
The most important new relationships to model in Neo4j from this research:
1. **Wexner <-> Epstein financial relationship** (POA, financial manager, $100M repayment)
2. **John Phelan flight log entries** (2006, verifiable dates/routes)
3. **Sultan Ahmed bin Sulayem** (newly unredacted name)
4. **French investigation reopened** (Brunel case, 2026-02)
5. **Maxwell cooperation offer** (contingent on clemency)
6. **Bondi subpoena** (April 14 deposition -- could yield new information)
7. **Compensation totals** (~$500M across all settlements)
