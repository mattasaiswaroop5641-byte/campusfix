import { Category, Priority, AIAnalysis, CampusIssue, RecurringIssueCluster } from '../types';

/**
 * ============================================================================
 * CAMPUSFIX AI ASSISTANCE & TRIAGE ENGINE
 * ============================================================================
 * 
 * NOTE FOR PRODUCTION UPGRADE:
 * This local heuristic engine provides instant, zero-latency classification,
 * priority scoring, and root-cause recommendations for the hackathon prototype.
 * 
 * To replace with Google Gemini API (@google/genai):
 * 1. npm install @google/genai
 * 2. const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
 * 3. const response = await ai.models.generateContent({
 *      model: 'gemini-2.5-flash',
 *      contents: prompt,
 *      config: { responseSchema: zodSchema }
 *    });
 * ============================================================================
 */

export interface AnalysisInput {
  title?: string;
  description: string;
  location: string;
  block: string;
  reporterType?: string;
}

export function analyzeCampusReport(input: AnalysisInput): AIAnalysis {
  const text = `${input.title || ''} ${input.description} ${input.location}`.toLowerCase();
  
  const keywordsFound: string[] = [];

  // 1. Category Classification
  let category: Category = 'Other';
  let categoryScore = 0;

  const categoryRules: { category: Category; keywords: string[]; weight: number }[] = [
    {
      category: 'Wi-Fi / Network',
      keywords: ['wifi', 'wi-fi', 'internet', 'network', 'connectivity', 'router', 'access point', 'hotspot', 'ping', 'latency', 'packet drop', 'intranet', 'ethernet', 'lan', 'disconnect'],
      weight: 1
    },
    {
      category: 'Electrical',
      keywords: ['light', 'bulb', 'electricity', 'socket', 'plug', 'switch', 'power', 'spark', 'short circuit', 'wire', 'wiring', 'tripped', 'breaker', 'fan', 'blackout'],
      weight: 1
    },
    {
      category: 'AC / HVAC',
      keywords: ['ac', 'air conditioner', 'cooling', 'hvac', 'warm air', 'thermostat', 'compressor', 'ventilation', 'chiller', 'blower', 'air conditioning', 'humidity', 'temperature'],
      weight: 1
    },
    {
      category: 'Plumbing',
      keywords: ['water', 'leakage', 'leak', 'tap', 'pipe', 'faucet', 'drainage', 'sink', 'toilet', 'flush', 'washroom', 'overflow', 'plumbing', 'sewage', 'clogged'],
      weight: 1
    },
    {
      category: 'Furniture',
      keywords: ['chair', 'desk', 'table', 'bench', 'podium', 'furniture', 'door', 'window', 'whiteboard', 'blackboard', 'hinge', 'seat', 'cushion', 'drawer'],
      weight: 1
    },
    {
      category: 'Computer / Equipment',
      keywords: ['computer', 'pc', 'projector', 'monitor', 'cpu', 'boot', 'keyboard', 'mouse', 'printer', 'scanner', 'screen', 'hdmi', 'hardware', 'workstation', 'ram', 'lab equipment'],
      weight: 1
    },
    {
      category: 'Cleanliness',
      keywords: ['clean', 'trash', 'dust', 'garbage', 'bin', 'spill', 'spillage', 'dirty', 'hygiene', 'sweeping', 'mess', 'cafeteria waste', 'sanitation', 'restroom cleaning'],
      weight: 1
    }
  ];

  for (const rule of categoryRules) {
    let matches = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        matches++;
        if (!keywordsFound.includes(kw)) keywordsFound.push(kw);
      }
    }
    if (matches > categoryScore) {
      categoryScore = matches;
      category = rule.category;
    }
  }

  // 2. Priority Estimation
  let priority: Priority = 'Medium';

  const highPriorityKeywords = [
    'entire lab', 'no internet', 'leakage', 'water leak', 'burst', 'damaged socket', 
    'spark', 'fire', 'smoke', 'emergency', 'urgent', 'critical', 'danger', 'hazard', 
    'all students', 'exam', 'flooding', 'blackout', 'falling', 'severe', 'unusable'
  ];

  const lowPriorityKeywords = [
    'one chair', 'flicker', 'cosmetic', 'minor', 'wobbly', 'paint', 'dusty', 
    'scratch', 'mild', 'optional', 'creaking', 'loose screw'
  ];

  const hasHigh = highPriorityKeywords.some(kw => text.includes(kw));
  const hasLow = lowPriorityKeywords.some(kw => text.includes(kw));

  if (hasHigh) {
    priority = 'High';
  } else if (hasLow) {
    priority = 'Low';
  } else {
    priority = 'Medium';
  }

  // Special overrides for critical safety
  if (text.includes('spark') || text.includes('fire hazard') || text.includes('water leakage') || text.includes('no internet in lab')) {
    priority = 'High';
  }

  // 3. AI Summary Generator
  let summary = '';
  const loc = input.location || input.block || 'the campus facility';

  switch (category) {
    case 'Wi-Fi / Network':
      summary = `Network connectivity appears to be degraded or unavailable in ${loc}.`;
      break;
    case 'Electrical':
      summary = `Electrical fixture or power delivery anomaly detected in ${loc}.`;
      break;
    case 'AC / HVAC':
      summary = `Climate control failure causing inadequate cooling/ventilation in ${loc}.`;
      break;
    case 'Plumbing':
      summary = `Plumbing leak or drainage issue causing moisture hazard in ${loc}.`;
      break;
    case 'Furniture':
      summary = `Physical furniture damage impacting seating or safety in ${loc}.`;
      break;
    case 'Computer / Equipment':
      summary = `IT hardware or audio-visual equipment malfunction in ${loc}.`;
      break;
    case 'Cleanliness':
      summary = `Sanitation or waste management attention required in ${loc}.`;
      break;
    default:
      summary = `Infrastructure maintenance issue reported in ${loc}.`;
  }

  // 4. Recommended Action
  let recommendedAction = '';
  switch (category) {
    case 'Wi-Fi / Network':
      recommendedAction = `Inspect the network access point, patch cables, and connectivity equipment in ${loc}.`;
      break;
    case 'Electrical':
      recommendedAction = `Check circuit breaker, test voltage line, and replace damaged electrical components in ${loc}.`;
      break;
    case 'AC / HVAC':
      recommendedAction = `Inspect AC compressor, check refrigerant gas, and clean air intake filters in ${loc}.`;
      break;
    case 'Plumbing':
      recommendedAction = `Isolate water supply valve immediately and replace ruptured pipe/faucet joints in ${loc}.`;
      break;
    case 'Furniture':
      recommendedAction = `Dispatch carpentry personnel to repair structural joints or replace with buffer stock.`;
      break;
    case 'Computer / Equipment':
      recommendedAction = `Run hardware diagnostics, inspect power/signal cables, and replace faulty peripherals.`;
      break;
    case 'Cleanliness':
      recommendedAction = `Deploy housekeeping team with disinfectant equipment and empty all waste disposal units.`;
      break;
    default:
      recommendedAction = `Assign campus facilities inspection team to assess and resolve the issue.`;
  }

  // Confidence calculation
  const confidence = Math.min(98, Math.max(85, 80 + keywordsFound.length * 4));

  return {
    category,
    priority,
    summary,
    recommendedAction,
    confidence,
    keywordsDetected: keywordsFound.length > 0 ? keywordsFound : ['campus infrastructure', 'general maintenance']
  };
}

/**
 * AI Recurring Issue Detection Engine
 * Clusters issues by Category + Normalized Location.
 * Identifies hotspots where multiple complaints have emerged.
 */
export function detectRecurringIssues(issues: CampusIssue[]): RecurringIssueCluster[] {
  const clusters: { [key: string]: CampusIssue[] } = {};

  issues.forEach(issue => {
    // Normalize location string: "Computer Lab 3", "computer lab 3", "Lab 3"
    const normLoc = issue.location.trim().toLowerCase().replace(/^(thes+)/, '');
    const key = `${issue.category}___${normLoc}___${issue.block}`;

    if (!clusters[key]) {
      clusters[key] = [];
    }
    clusters[key].push(issue);
  });

  const recurringList: RecurringIssueCluster[] = [];

  Object.entries(clusters).forEach(([key, groupIssues]) => {
    if (groupIssues.length >= 2) {
      const first = groupIssues[0];
      
      let recommendation = '';
      if (first.category === 'Wi-Fi / Network') {
        recommendation = `Inspect the network infrastructure, access point firmware, and switch capacity in ${first.location}.`;
      } else if (first.category === 'Electrical') {
        recommendation = `Perform a comprehensive load test and rewiring inspection on circuit breakers feeding ${first.location}.`;
      } else if (first.category === 'AC / HVAC') {
        recommendation = `Schedule full compressor servicing and duct inspection for ${first.location}.`;
      } else if (first.category === 'Plumbing') {
        recommendation = `Replace aging main pipe manifold and seal moisture barriers in ${first.location}.`;
      } else {
        recommendation = `Conduct a comprehensive facility audit and preventive maintenance cycle in ${first.location}.`;
      }

      recurringList.push({
        id: `cluster-${key}`,
        category: first.category,
        location: first.location,
        block: first.block,
        count: groupIssues.length,
        issues: groupIssues,
        severity: groupIssues.some(i => i.priority === 'High') ? 'High' : 'Medium',
        recommendation
      });
    }
  });

  // Sort by highest count & severity
  return recurringList.sort((a, b) => b.count - a.count);
}
