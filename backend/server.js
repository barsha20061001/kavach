import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");
const PORT = Number(process.env.PORT || 5000);

const app = express();
app.use(cors());
app.use(express.json());

function readCsv(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const text = fs.readFileSync(filePath, "utf8");
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  });
}

function n(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function isoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function groupCount(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (key === undefined || key === null || key === "") continue;
    counts.set(String(key), (counts.get(String(key)) || 0) + 1);
  }
  return counts;
}

function topEntries(counts, limit = 10) {
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

const db = {
  cases: readCsv("CaseMaster.csv"),
  districts: readCsv("District.csv"),
  units: readCsv("Unit.csv"),
  crimeHeads: readCsv("CrimeHead.csv"),
  crimeSubHeads: readCsv("CrimeSubHead.csv"),
  statuses: readCsv("CaseStatusMaster.csv"),
  gravity: readCsv("GravityOffence.csv"),
  accused: readCsv("Accused.csv"),
  victims: readCsv("Victim.csv"),
  complainants: readCsv("ComplainantDetails.csv"),
  arrests: readCsv("ArrestSurrender.csv"),
  chargesheets: readCsv("ChargesheetDetails.csv"),
  persons: readCsv("PersonMaster_EXT.csv"),
  moMaster: readCsv("ModusOperandiMaster_EXT.csv"),
  caseMo: readCsv("CaseModusOperandi_EXT.csv"),
  socio: readCsv("DistrictSocioEconomic_EXT.csv"),
  employees: readCsv("Employee.csv"),
  courts: readCsv("Court.csv")
};

const index = {
  districts: new Map(db.districts.map(x => [String(x.DistrictID), x])),
  units: new Map(db.units.map(x => [String(x.UnitID), x])),
  heads: new Map(db.crimeHeads.map(x => [String(x.CrimeHeadID), x])),
  subHeads: new Map(db.crimeSubHeads.map(x => [String(x.CrimeSubHeadID), x])),
  statuses: new Map(db.statuses.map(x => [String(x.CaseStatusID), x])),
  gravity: new Map(db.gravity.map(x => [String(x.GravityOffenceID), x])),
  persons: new Map(db.persons.map(x => [String(x.PersonMasterID), x])),
  mo: new Map(db.moMaster.map(x => [String(x.MOID), x])),
  socio: new Map(db.socio.map(x => [String(x.DistrictID), x]))
};

function caseDistrictId(c) {
  return String(index.units.get(String(c.PoliceStationID))?.DistrictID || "");
}

function enrichCase(c) {
  const districtId = caseDistrictId(c);
  return {
    ...c,
    districtId,
    districtName: index.districts.get(districtId)?.DistrictName || "Unknown",
    policeStationName: index.units.get(String(c.PoliceStationID))?.UnitName || "Unknown",
    crimeHeadName: index.heads.get(String(c.CrimeMajorHeadID))?.CrimeGroupName || "Unknown",
    crimeSubHeadName:
      index.subHeads.get(String(c.CrimeMinorHeadID))?.CrimeHeadName || "Unknown",
    statusName: index.statuses.get(String(c.CaseStatusID))?.CaseStatusName || "Unknown",
    gravityName: index.gravity.get(String(c.GravityOffenceID))?.LookupValue || "Unknown"
  };
}

function filterCases(req) {
  let rows = db.cases;
  const { districtId, crimeHeadId, statusId, from, to } = req.query;

  if (districtId) rows = rows.filter(c => caseDistrictId(c) === String(districtId));
  if (crimeHeadId) rows = rows.filter(c => String(c.CrimeMajorHeadID) === String(crimeHeadId));
  if (statusId) rows = rows.filter(c => String(c.CaseStatusID) === String(statusId));

  const fromDate = isoDate(from);
  const toDate = isoDate(to);
  if (fromDate) rows = rows.filter(c => (isoDate(c.CrimeRegisteredDate)?.getTime() || 0) >= fromDate.getTime());
  if (toDate) rows = rows.filter(c => (isoDate(c.CrimeRegisteredDate)?.getTime() || 0) <= toDate.getTime());

  return rows;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "Kavach AI local CSV API is running",
    caseCount: db.cases.length,
    districtCount: db.districts.length
  });
});

app.get("/api/lookups", (_req, res) => {
  res.json({
    districts: db.districts,
    crimeHeads: db.crimeHeads,
    crimeSubHeads: db.crimeSubHeads,
    statuses: db.statuses,
    gravity: db.gravity
  });
});

app.get("/api/dashboard", (req, res) => {
  const cases = filterCases(req);
  const districtCounts = groupCount(cases, caseDistrictId);
  const statusCounts = groupCount(cases, c => c.CaseStatusID);
  const headCounts = groupCount(cases, c => c.CrimeMajorHeadID);

  const severeCases = cases.filter(c => String(c.GravityOffenceID) === "2").length;
  const arrests = new Set(db.arrests.map(a => String(a.CaseMasterID)));
  const chargesheets = new Set(db.chargesheets.map(a => String(a.CaseMasterID)));

  const recentCases = [...cases]
    .sort((a, b) => (isoDate(b.CrimeRegisteredDate)?.getTime() || 0) - (isoDate(a.CrimeRegisteredDate)?.getTime() || 0))
    .slice(0, 8)
    .map(enrichCase);

  res.json({
    kpis: {
      totalCases: cases.length,
      severeCases,
      arrestLinkedCases: cases.filter(c => arrests.has(String(c.CaseMasterID))).length,
      chargesheetedCases: cases.filter(c => chargesheets.has(String(c.CaseMasterID))).length,
      districtsCovered: new Set(cases.map(caseDistrictId).filter(Boolean)).size
    },
    casesByStatus: topEntries(statusCounts, 10).map(x => ({
      statusId: x.id,
      statusName: index.statuses.get(x.id)?.CaseStatusName || "Unknown",
      count: x.count
    })),
    topCrimeTypes: topEntries(headCounts, 8).map(x => ({
      crimeHeadId: x.id,
      crimeHeadName: index.heads.get(x.id)?.CrimeGroupName || "Unknown",
      count: x.count
    })),
    topDistricts: topEntries(districtCounts, 10).map(x => ({
      districtId: x.id,
      districtName: index.districts.get(x.id)?.DistrictName || "Unknown",
      count: x.count
    })),
    recentCases
  });
});

app.get("/api/crime-trends", (req, res) => {
  const cases = filterCases(req);
  const buckets = new Map();

  for (const c of cases) {
    const d = isoDate(c.CrimeRegisteredDate);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  const monthlyTrend = [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  const crimeTypeCounts = groupCount(cases, c => c.CrimeMajorHeadID);
  res.json({
    monthlyTrend,
    crimeTypes: topEntries(crimeTypeCounts, 12).map(x => ({
      crimeHeadId: x.id,
      crimeHeadName: index.heads.get(x.id)?.CrimeGroupName || "Unknown",
      count: x.count
    }))
  });
});

app.get("/api/hotspots", (req, res) => {
  const cases = filterCases(req)
    .filter(c => Number.isFinite(Number(c.latitude)) && Number.isFinite(Number(c.longitude)))
    .map(enrichCase);

  const points = cases.map(c => ({
    caseId: c.CaseMasterID,
    crimeNo: c.CrimeNo,
    latitude: n(c.latitude),
    longitude: n(c.longitude),
    districtId: c.districtId,
    districtName: c.districtName,
    crimeHeadName: c.crimeHeadName,
    gravityName: c.gravityName,
    date: c.CrimeRegisteredDate
  }));

  const districtCounts = groupCount(cases, c => c.districtId);
  const clusters = topEntries(districtCounts, 31).map(x => {
    const districtCases = points.filter(p => p.districtId === x.id);
    const lat = districtCases.reduce((s, p) => s + p.latitude, 0) / districtCases.length;
    const lng = districtCases.reduce((s, p) => s + p.longitude, 0) / districtCases.length;
    return {
      districtId: x.id,
      districtName: index.districts.get(x.id)?.DistrictName || "Unknown",
      count: x.count,
      latitude: lat,
      longitude: lng,
      risk: x.count >= 100 ? "high" : x.count >= 70 ? "medium" : "low"
    };
  });

  res.json({ points, clusters });
});

app.get("/api/repeat-offenders", (req, res) => {
  const minCases = Math.max(2, Number(req.query.minCases || 2));
  const byPerson = new Map();

  for (const a of db.accused) {
    const personId = String(a.PersonMasterID || a.PersonID || "");
    if (!personId) continue;
    if (!byPerson.has(personId)) byPerson.set(personId, []);
    byPerson.get(personId).push(a);
  }

  const offenders = [...byPerson.entries()]
    .filter(([, rows]) => new Set(rows.map(r => r.CaseMasterID)).size >= minCases)
    .map(([personId, rows]) => {
      const caseIds = [...new Set(rows.map(r => String(r.CaseMasterID)))];
      const person = index.persons.get(personId);
      const relatedCases = db.cases.filter(c => caseIds.includes(String(c.CaseMasterID))).map(enrichCase);
      return {
        personId,
        name: person?.PersonName || rows[0]?.AccusedName || "Unknown",
        age: person?.AgeYear || rows[0]?.AgeYear || "",
        caseCount: caseIds.length,
        districts: [...new Set(relatedCases.map(c => c.districtName))],
        crimeTypes: [...new Set(relatedCases.map(c => c.crimeHeadName))],
        preferredMO: index.mo.get(String(person?.PreferredMOID))?.MOName || "Unknown",
        lastKnownCaseDate: relatedCases
          .map(c => c.CrimeRegisteredDate)
          .filter(Boolean)
          .sort()
          .at(-1)
      };
    })
    .sort((a, b) => b.caseCount - a.caseCount)
    .slice(0, 100);

  res.json({ offenders });
});

app.get("/api/network", (req, res) => {
  const maxCases = Math.min(500, Math.max(20, Number(req.query.maxCases || 150)));
  const accusedByCase = new Map();

  for (const a of db.accused) {
    const caseId = String(a.CaseMasterID);
    if (!accusedByCase.has(caseId)) accusedByCase.set(caseId, []);
    accusedByCase.get(caseId).push(a);
  }

  const nodes = new Map();
  const edgeCounts = new Map();

  for (const [, accusedRows] of [...accusedByCase.entries()].slice(0, maxCases)) {
    const people = accusedRows
      .map(a => ({
        id: String(a.PersonMasterID || a.PersonID || `accused-${a.AccusedMasterID}`),
        label: index.persons.get(String(a.PersonMasterID))?.PersonName || a.AccusedName || "Unknown"
      }))
      .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);

    for (const p of people) nodes.set(p.id, p);

    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const pair = [people[i].id, people[j].id].sort();
        const key = pair.join("|");
        edgeCounts.set(key, (edgeCounts.get(key) || 0) + 1);
      }
    }
  }

  const degree = new Map();
  const edges = [...edgeCounts.entries()].map(([key, weight]) => {
    const [source, target] = key.split("|");
    degree.set(source, (degree.get(source) || 0) + weight);
    degree.set(target, (degree.get(target) || 0) + weight);
    return { source, target, weight };
  });

  const nodeList = [...nodes.values()].map(node => ({
    ...node,
    degree: degree.get(node.id) || 0,
    risk: (degree.get(node.id) || 0) >= 6 ? "high" : (degree.get(node.id) || 0) >= 3 ? "medium" : "low"
  }));

  res.json({ nodes: nodeList, edges });
});

app.get("/api/predictive", (req, res) => {
  const cases = filterCases(req);
  const byDistrict = new Map();

  for (const c of cases) {
    const districtId = caseDistrictId(c);
    const d = isoDate(c.CrimeRegisteredDate);
    if (!districtId || !d) continue;
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byDistrict.has(districtId)) byDistrict.set(districtId, new Map());
    const m = byDistrict.get(districtId);
    m.set(month, (m.get(month) || 0) + 1);
  }

  const predictions = [...byDistrict.entries()].map(([districtId, months]) => {
    const values = [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
    const recent = values.slice(-3);
    const previous = values.slice(-6, -3);
    const forecast = Math.round(recent.reduce((a, b) => a + b, 0) / Math.max(1, recent.length));
    const previousAvg = previous.reduce((a, b) => a + b, 0) / Math.max(1, previous.length);
    const changePercent = previousAvg ? Math.round(((forecast - previousAvg) / previousAvg) * 100) : 0;

    return {
      districtId,
      districtName: index.districts.get(districtId)?.DistrictName || "Unknown",
      predictedNextMonth: forecast,
      changePercent,
      risk: forecast >= 12 ? "high" : forecast >= 8 ? "medium" : "low"
    };
  }).sort((a, b) => b.predictedNextMonth - a.predictedNextMonth);

  res.json({
    model: "Three-month moving-average demonstration model",
    predictions
  });
});

app.get("/api/districts", (_req, res) => {
  const counts = groupCount(db.cases, caseDistrictId);
  const districts = db.districts.map(d => {
    const socio = index.socio.get(String(d.DistrictID));
    return {
      ...d,
      caseCount: counts.get(String(d.DistrictID)) || 0,
      socioeconomic: socio || null
    };
  }).sort((a, b) => b.caseCount - a.caseCount);

  res.json({ districts });
});

app.get("/api/district-analytics/:districtId", (req, res) => {
  const districtId = String(req.params.districtId);
  const district = index.districts.get(districtId);
  if (!district) return res.status(404).json({ message: "District not found" });

  const cases = db.cases.filter(c => caseDistrictId(c) === districtId);
  const headCounts = groupCount(cases, c => c.CrimeMajorHeadID);
  const statusCounts = groupCount(cases, c => c.CaseStatusID);

  res.json({
    district,
    socioeconomic: index.socio.get(districtId) || null,
    kpis: {
      totalCases: cases.length,
      severeCases: cases.filter(c => String(c.GravityOffenceID) === "2").length,
      policeStations: new Set(
        db.units.filter(u => String(u.DistrictID) === districtId).map(u => u.UnitID)
      ).size,
      officers: db.employees.filter(e => String(e.DistrictID) === districtId).length
    },
    crimeTypes: topEntries(headCounts, 10).map(x => ({
      name: index.heads.get(x.id)?.CrimeGroupName || "Unknown",
      count: x.count
    })),
    statuses: topEntries(statusCounts, 10).map(x => ({
      name: index.statuses.get(x.id)?.CaseStatusName || "Unknown",
      count: x.count
    })),
    recentCases: [...cases]
      .sort((a, b) => (isoDate(b.CrimeRegisteredDate)?.getTime() || 0) - (isoDate(a.CrimeRegisteredDate)?.getTime() || 0))
      .slice(0, 20)
      .map(enrichCase)
  });
});

app.get("/api/reports", (req, res) => {
  const cases = filterCases(req).map(enrichCase);
  res.json({
    generatedAt: new Date().toISOString(),
    total: cases.length,
    rows: cases
  });
});

app.get("/api/alerts", (_req, res) => {
  const districtCounts = topEntries(groupCount(db.cases, caseDistrictId), 8);
  const repeatPersons = topEntries(groupCount(db.accused, a => a.PersonMasterID || a.PersonID), 10)
    .filter(x => x.count >= 3);

  const alerts = [
    ...districtCounts.slice(0, 5).map((x, i) => ({
      id: `district-${x.id}`,
      severity: i < 2 ? "high" : "medium",
      title: `High case concentration in ${index.districts.get(x.id)?.DistrictName || "district"}`,
      description: `${x.count} registered cases are present in the current dataset.`,
      type: "hotspot"
    })),
    ...repeatPersons.slice(0, 5).map(x => ({
      id: `person-${x.id}`,
      severity: x.count >= 5 ? "high" : "medium",
      title: "Repeat-offender pattern detected",
      description: `${index.persons.get(x.id)?.PersonName || "A person"} is linked to ${x.count} accused records.`,
      type: "offender"
    }))
  ];

  res.json({ alerts });
});

app.get("/api/search", (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  if (!q) return res.json({ cases: [], people: [], districts: [] });

  const cases = db.cases
    .filter(c =>
      [c.CrimeNo, c.CaseNo, c.BriefFacts, c.CaseMasterID]
        .some(v => String(v || "").toLowerCase().includes(q))
    )
    .slice(0, 50)
    .map(enrichCase);

  const people = db.persons
    .filter(p =>
      [p.PersonName, p.PersonMasterID]
        .some(v => String(v || "").toLowerCase().includes(q))
    )
    .slice(0, 50);

  const districts = db.districts
    .filter(d => d.DistrictName.toLowerCase().includes(q))
    .slice(0, 20);

  res.json({ cases, people, districts });
});

app.post("/api/assistant", (req, res) => {
  const question = String(req.body.question || "").trim();
  const lower = question.toLowerCase();
  const districtCounts = topEntries(groupCount(db.cases, caseDistrictId), 5);
  const crimeCounts = topEntries(groupCount(db.cases, c => c.CrimeMajorHeadID), 5);

  let answer = "Ask about total cases, top districts, major crime types, repeat offenders, or hotspot risk.";

  if (lower.includes("total") && lower.includes("case")) {
    answer = `The dataset contains ${db.cases.length} registered cases.`;
  } else if (lower.includes("district") || lower.includes("hotspot")) {
    answer = `The highest case concentration is in ${
      index.districts.get(districtCounts[0]?.id)?.DistrictName || "the leading district"
    } with ${districtCounts[0]?.count || 0} cases.`;
  } else if (lower.includes("crime") || lower.includes("type")) {
    answer = `The leading crime category is ${
      index.heads.get(crimeCounts[0]?.id)?.CrimeGroupName || "Unknown"
    } with ${crimeCounts[0]?.count || 0} cases.`;
  } else if (lower.includes("repeat") || lower.includes("offender")) {
    const repeats = [...groupCount(db.accused, a => a.PersonMasterID || a.PersonID).values()]
      .filter(count => count >= 2).length;
    answer = `${repeats} people are linked to at least two accused records in this demonstration dataset.`;
  }

  res.json({
    answer,
    note: "This endpoint is dataset-grounded and rule-based. Connect Gemini later without changing the frontend contract."
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Kavach AI API running at http://localhost:${PORT}`);
});
