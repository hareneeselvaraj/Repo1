// ─── Organization & Position Data ────────────────────────────────────────────

export interface OrgUnit {
  id: string;
  code: string;
  name: string;
  type: "Enterprise" | "Region" | "Site" | "Department" | "Function" | "Team";
  parentId: string | null;
  headPosition?: string;
  headPerson?: string;
  activeFlag: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  childCount?: number;
}

export const orgUnits: OrgUnit[] = [
  { id: "OU-001", code: "ACME", name: "AcmeMfg Enterprise", type: "Enterprise", parentId: null, headPosition: "CEO", headPerson: "Vikram Sharma", activeFlag: true, effectiveFrom: "2020-01-01", childCount: 3 },
  { id: "OU-002", code: "ACME-IND", name: "India Region", type: "Region", parentId: "OU-001", headPosition: "Regional Director", headPerson: "Suresh Babu", activeFlag: true, effectiveFrom: "2020-01-01", childCount: 3 },
  { id: "OU-003", code: "ACME-CHN", name: "Chennai Site", type: "Site", parentId: "OU-002", headPosition: "Site Head", headPerson: "Anand Raj", activeFlag: true, effectiveFrom: "2020-01-01", childCount: 4 },
  { id: "OU-004", code: "ACME-MUM", name: "Mumbai Site", type: "Site", parentId: "OU-002", headPosition: "Site Head", headPerson: "Priya Nair", activeFlag: true, effectiveFrom: "2021-06-01", childCount: 3 },
  { id: "OU-005", code: "ACME-PUN", name: "Pune Site", type: "Site", parentId: "OU-002", headPosition: "Site Head", headPerson: "Ramesh Pillai", activeFlag: true, effectiveFrom: "2022-01-01", childCount: 2 },
  { id: "OU-006", code: "CHN-ASSM", name: "Assembly Department", type: "Department", parentId: "OU-003", headPosition: "Dept Head – Assembly", headPerson: "Deepa Krishnan", activeFlag: true, effectiveFrom: "2020-01-01", childCount: 3 },
  { id: "OU-007", code: "CHN-QC",   name: "Quality Control", type: "Department", parentId: "OU-003", headPosition: "QC Manager", headPerson: "Meena Sundaram", activeFlag: true, effectiveFrom: "2020-01-01", childCount: 2 },
  { id: "OU-008", code: "CHN-MAINT", name: "Maintenance", type: "Department", parentId: "OU-003", headPosition: "Maintenance Manager", headPerson: "Kiran Varma", activeFlag: true, effectiveFrom: "2020-01-01", childCount: 1 },
  { id: "OU-009", code: "CHN-LOG",  name: "Logistics", type: "Department", parentId: "OU-003", headPosition: "Logistics Lead", headPerson: "Not Resolved", activeFlag: true, effectiveFrom: "2020-01-01", childCount: 1 },
  { id: "OU-010", code: "CHN-ASSM-L1", name: "Assembly Line 1", type: "Team", parentId: "OU-006", headPosition: "Line Supervisor – Line 1", headPerson: "Ravi Kumar", activeFlag: true, effectiveFrom: "2020-01-01", childCount: 0 },
  { id: "OU-011", code: "CHN-ASSM-L2", name: "Assembly Line 2", type: "Team", parentId: "OU-006", headPosition: "Line Supervisor – Line 2", headPerson: "Not Resolved", activeFlag: true, effectiveFrom: "2020-01-01", childCount: 0 },
  { id: "OU-012", code: "CHN-ASSM-L3", name: "Assembly Line 3", type: "Team", parentId: "OU-006", headPosition: "Line Supervisor – Line 3", headPerson: "Arun Sekar", activeFlag: true, effectiveFrom: "2021-01-01", childCount: 0 },
];

export interface Position {
  id: string;
  code: string;
  name: string;
  scopeType: "Enterprise" | "Site" | "Department" | "Team";
  orgUnit: string;
  reportsTo: string;
  activeFlag: boolean;
  canOwn: boolean;
  canReview: boolean;
  canApprove: boolean;
  linkedRoleSheets: number;
  activeAssignments: number;
  linkedProcesses: number;
  linkedMeasures: number;
}

export const positions: Position[] = [
  { id: "POS-001", code: "PS-001", name: "Production Supervisor",    scopeType: "Department", orgUnit: "Assembly Department",  reportsTo: "Dept Head – Assembly",   activeFlag: true,  canOwn: true,  canReview: true,  canApprove: true,  linkedRoleSheets: 2, activeAssignments: 1, linkedProcesses: 8,  linkedMeasures: 12 },
  { id: "POS-002", code: "PS-002", name: "Quality Inspector",        scopeType: "Team",       orgUnit: "Quality Control",       reportsTo: "QC Manager",              activeFlag: true,  canOwn: true,  canReview: true,  canApprove: false, linkedRoleSheets: 1, activeAssignments: 0, linkedProcesses: 5,  linkedMeasures: 8  },
  { id: "POS-003", code: "PS-003", name: "Process Engineer",         scopeType: "Site",       orgUnit: "Chennai Site",          reportsTo: "Site Head",               activeFlag: true,  canOwn: true,  canReview: true,  canApprove: true,  linkedRoleSheets: 3, activeAssignments: 1, linkedProcesses: 15, linkedMeasures: 20 },
  { id: "POS-004", code: "PS-004", name: "Shift Supervisor",         scopeType: "Team",       orgUnit: "Assembly Line 1",       reportsTo: "Production Supervisor",   activeFlag: true,  canOwn: false, canReview: false, canApprove: false, linkedRoleSheets: 1, activeAssignments: 1, linkedProcesses: 4,  linkedMeasures: 6  },
  { id: "POS-005", code: "PS-005", name: "Maintenance Lead",         scopeType: "Department", orgUnit: "Maintenance",           reportsTo: "Maintenance Manager",     activeFlag: true,  canOwn: true,  canReview: false, canApprove: false, linkedRoleSheets: 1, activeAssignments: 0, linkedProcesses: 6,  linkedMeasures: 5  },
  { id: "POS-006", code: "PS-006", name: "Safety Officer",           scopeType: "Site",       orgUnit: "Chennai Site",          reportsTo: "Site Head",               activeFlag: true,  canOwn: true,  canReview: true,  canApprove: false, linkedRoleSheets: 2, activeAssignments: 1, linkedProcesses: 3,  linkedMeasures: 4  },
  { id: "POS-007", code: "PS-007", name: "QC Manager",               scopeType: "Department", orgUnit: "Quality Control",       reportsTo: "Site Head",               activeFlag: true,  canOwn: true,  canReview: true,  canApprove: true,  linkedRoleSheets: 2, activeAssignments: 1, linkedProcesses: 10, linkedMeasures: 15 },
  { id: "POS-008", code: "PS-008", name: "Logistics Lead",           scopeType: "Department", orgUnit: "Logistics",             reportsTo: "Site Head",               activeFlag: false, canOwn: true,  canReview: false, canApprove: false, linkedRoleSheets: 1, activeAssignments: 0, linkedProcesses: 4,  linkedMeasures: 3  },
  { id: "POS-009", code: "PS-009", name: "Line Supervisor – Line 1", scopeType: "Team",       orgUnit: "Assembly Line 1",       reportsTo: "Production Supervisor",   activeFlag: true,  canOwn: false, canReview: false, canApprove: false, linkedRoleSheets: 1, activeAssignments: 1, linkedProcesses: 3,  linkedMeasures: 5  },
  { id: "POS-010", code: "PS-010", name: "Senior Process Engineer",  scopeType: "Site",       orgUnit: "Chennai Site",          reportsTo: "Process Engineer",        activeFlag: true,  canOwn: true,  canReview: true,  canApprove: false, linkedRoleSheets: 1, activeAssignments: 1, linkedProcesses: 7,  linkedMeasures: 9  },
];

export interface Person {
  id: string;
  code: string;
  name: string;
  email: string;
  homeOrg: string;
  employmentType: "Full-time" | "Contract" | "Temporary";
  status: "Active" | "Inactive" | "On Leave";
  initials: string;
  activeAssignments: number;
}

export const people: Person[] = [
  { id: "PER-001", code: "EMP-1001", name: "Ravi Kumar",      email: "ravi.kumar@acmemfg.com",      homeOrg: "Chennai / Assembly / Line 1",       employmentType: "Full-time", status: "Active",   initials: "RK", activeAssignments: 2 },
  { id: "PER-002", code: "EMP-1002", name: "Priya Nair",      email: "priya.nair@acmemfg.com",      homeOrg: "Mumbai / Production",               employmentType: "Full-time", status: "Active",   initials: "PN", activeAssignments: 1 },
  { id: "PER-003", code: "EMP-1003", name: "Anand Raj",       email: "anand.raj@acmemfg.com",       homeOrg: "Chennai Site",                      employmentType: "Full-time", status: "Active",   initials: "AR", activeAssignments: 3 },
  { id: "PER-004", code: "EMP-1004", name: "Deepa Krishnan",  email: "deepa.k@acmemfg.com",         homeOrg: "Chennai / Assembly",                employmentType: "Full-time", status: "Active",   initials: "DK", activeAssignments: 2 },
  { id: "PER-005", code: "EMP-1005", name: "Suresh Babu",     email: "suresh.babu@acmemfg.com",     homeOrg: "India Region",                      employmentType: "Full-time", status: "Active",   initials: "SB", activeAssignments: 1 },
  { id: "PER-006", code: "EMP-1006", name: "Meena Sundaram",  email: "meena.s@acmemfg.com",         homeOrg: "Chennai / QC",                      employmentType: "Full-time", status: "Active",   initials: "MS", activeAssignments: 2 },
  { id: "PER-007", code: "EMP-1007", name: "Ramesh Pillai",   email: "ramesh.p@acmemfg.com",        homeOrg: "Pune Site",                         employmentType: "Full-time", status: "Active",   initials: "RP", activeAssignments: 1 },
  { id: "PER-008", code: "EMP-1008", name: "Kiran Varma",     email: "kiran.v@acmemfg.com",         homeOrg: "Chennai / Maintenance",             employmentType: "Contract",  status: "Active",   initials: "KV", activeAssignments: 1 },
  { id: "PER-009", code: "EMP-1009", name: "Arun Sekar",      email: "arun.s@acmemfg.com",          homeOrg: "Chennai / Assembly / Line 3",       employmentType: "Full-time", status: "Active",   initials: "AS", activeAssignments: 2 },
  { id: "PER-010", code: "EMP-1010", name: "Lakshmi Iyer",    email: "lakshmi.i@acmemfg.com",       homeOrg: "Chennai / QC",                      employmentType: "Full-time", status: "On Leave", initials: "LI", activeAssignments: 0 },
  { id: "PER-011", code: "EMP-1011", name: "Vikram Sharma",   email: "vikram.sharma@acmemfg.com",   homeOrg: "AcmeMfg Enterprise",                employmentType: "Full-time", status: "Active",   initials: "VS", activeAssignments: 1 },
  { id: "PER-012", code: "EMP-1012", name: "Nisha Menon",     email: "nisha.m@acmemfg.com",         homeOrg: "Mumbai / Production",               employmentType: "Temporary", status: "Inactive", initials: "NM", activeAssignments: 0 },
];

export interface Assignment {
  id: string;
  person: string;
  personCode: string;
  position: string;
  positionCode: string;
  assignmentType: "Primary" | "Secondary" | "Acting";
  isPrimary: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  context: { site: string; department?: string; line?: string; shift?: string };
  status: "Active" | "Expired" | "Expiring" | "Pending";
}

export const assignments: Assignment[] = [
  { id: "ASN-001", person: "Ravi Kumar",     personCode: "EMP-1001", position: "Production Supervisor",    positionCode: "PS-001", assignmentType: "Primary",   isPrimary: true,  effectiveFrom: "2023-01-01", effectiveTo: "2027-12-31", context: { site: "Chennai", department: "Assembly", line: "Line 1", shift: "Day" }, status: "Active" },
  { id: "ASN-002", person: "Ravi Kumar",     personCode: "EMP-1001", position: "Line Supervisor – Line 1", positionCode: "PS-009", assignmentType: "Secondary",  isPrimary: false, effectiveFrom: "2024-06-01", effectiveTo: "2026-03-31", context: { site: "Chennai", department: "Assembly", line: "Line 1"                }, status: "Expiring" },
  { id: "ASN-003", person: "Anand Raj",      personCode: "EMP-1003", position: "Process Engineer",         positionCode: "PS-003", assignmentType: "Primary",   isPrimary: true,  effectiveFrom: "2022-01-01",                           context: { site: "Chennai"                                                        }, status: "Active" },
  { id: "ASN-004", person: "Deepa Krishnan", personCode: "EMP-1004", position: "Senior Process Engineer",  positionCode: "PS-010", assignmentType: "Primary",   isPrimary: true,  effectiveFrom: "2023-06-01",                           context: { site: "Chennai", department: "Assembly"                                }, status: "Active" },
  { id: "ASN-005", person: "Meena Sundaram", personCode: "EMP-1006", position: "QC Manager",               positionCode: "PS-007", assignmentType: "Primary",   isPrimary: true,  effectiveFrom: "2021-03-01",                           context: { site: "Chennai", department: "Quality Control"                         }, status: "Active" },
  { id: "ASN-006", person: "Kiran Varma",    personCode: "EMP-1008", position: "Maintenance Lead",         positionCode: "PS-005", assignmentType: "Primary",   isPrimary: true,  effectiveFrom: "2024-01-01", effectiveTo: "2026-03-10", context: { site: "Chennai", department: "Maintenance"                             }, status: "Expired" },
  { id: "ASN-007", person: "Priya Nair",     personCode: "EMP-1002", position: "Safety Officer",           positionCode: "PS-006", assignmentType: "Acting",    isPrimary: false, effectiveFrom: "2026-02-01", effectiveTo: "2026-04-30", context: { site: "Chennai"                                                        }, status: "Active" },
  { id: "ASN-008", person: "Arun Sekar",     personCode: "EMP-1009", position: "Shift Supervisor",         positionCode: "PS-004", assignmentType: "Primary",   isPrimary: true,  effectiveFrom: "2023-09-01",                           context: { site: "Chennai", department: "Assembly", line: "Line 3", shift: "Day" }, status: "Active" },
];
