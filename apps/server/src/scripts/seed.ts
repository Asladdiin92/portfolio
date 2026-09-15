/**
 * Seed script — populates MongoDB with Asladdiin's real portfolio projects.
 *
 * Usage:
 *   pnpm --filter @portfolio/server seed
 *
 * Safe to re-run: clears existing projects before inserting.
 */

import mongoose from 'mongoose';
import { ProjectModel } from '../models/Project.js';
import { env } from '../config/env.js';

const BASE = 'https://github.com/Asladdiin92';

// ── Seed data ─────────────────────────────────────────────────────────────────

const projects = [
  // ── Featured ───────────────────────────────────────────────────────────────
  {
    title: 'IT Inventory System',
    description: `## Overview

A multi-layered IT inventory management platform covering three core concerns:
the **business layer** (multi-tenancy, RBAC), the **network differentiator**
(IPAM, SSH integration), and the **ops layer** (CI/CD pipeline, monitoring).

## Key Features

- Multi-tenant architecture with role-based access control (RBAC)
- IP Address Management (IPAM) module
- SSH integration for remote device management
- CI/CD pipeline and production monitoring layer
- JavaScript full-stack implementation

## Technical Highlights

Designed around a clean separation of the business, network, and operations
concerns — each layer is independently deployable and communicates via a
well-defined internal API boundary.`,
    techStack: ['JavaScript', 'Node.js', 'RBAC', 'IPAM', 'SSH', 'CI/CD', 'Monitoring'],
    githubUrl: `${BASE}/it-inventory-system`,
    featured: true,
  },
  {
    title: 'CCI Department Guidance System',
    description: `## Overview

A full-stack web application that guides students through academic department
selection. The system analyses requirements, produces complete design
documentation, and walks users through the implementation process.

## Key Features

- Analyzed system requirements and complete design documentation
- Step-by-step implementation guidance for department selection
- Responsive JavaScript frontend
- Private repository — available on request

## Technical Highlights

Built as a private repository with a focus on structured requirements analysis
and design documentation before implementation — a real software engineering
lifecycle project.`,
    techStack: ['JavaScript', 'Node.js', 'React', 'Supabase', 'Vercel', 'Railway'],
    githubUrl: `${BASE}/cci-department-guidance`,
    featured: true,
  },
  {
    title: 'Weather Dashboard',
    description: `## Overview

A responsive weather dashboard that fetches live data from the OpenWeatherMap
API, displaying current conditions alongside a 5-day forecast.

## Key Features

- Real-time weather data via OpenWeatherMap API
- Current conditions: temperature, humidity, wind speed, description
- 5-day forecast with daily summaries
- Responsive layout that works across all screen sizes

## Technical Highlights

Demonstrates clean API integration with proper error handling, loading states,
and responsive CSS layout — a practical example of consuming a public REST API
in a browser application.`,
    techStack: ['JavaScript', 'HTML5', 'CSS3', 'OpenWeatherMap API', 'REST APIs'],
    githubUrl: `${BASE}/weather-dashboard`,
    featured: true,
  },
  {
    title: 'Chatbot App',
    description: `## Overview

A Python-based chatbot application demonstrating natural language interaction
and conversational logic.

## Key Features

- Interactive conversational interface
- Python-powered response logic
- Extensible intent and response handling

## Technical Highlights

Built in Python, showcasing scripting skills and the ability to implement
conversational flows — a foundation for more advanced NLP integrations.`,
    techStack: ['Python'],
    githubUrl: `${BASE}/-chatbot-app`,
    featured: false,
  },

  // ── Desktop / Academic ──────────────────────────────────────────────────────
  {
    title: 'Hotel Management System (Java)',
    description: `## Overview

A comprehensive desktop application for full-suite hotel workflow management:
room bookings, guest records, billing, and database CRUD operations. Developed
at Haramaya University demonstrating object-oriented design and Java database
integration.

## Key Features

- Room availability tracking and booking management
- Guest registration and history lookup
- Invoice and billing generation
- Full CRUD against MariaDB/MySQL via JDBC
- Swing UI built with NetBeans GUI Builder

## Technical Highlights

Layered MVC architecture — Swing forms delegate to service classes connected
via JDBC. PreparedStatements used throughout to prevent SQL injection. XAMPP
provides the local MariaDB server.`,
    techStack: ['Java', 'NetBeans', 'MariaDB', 'MySQL', 'JDBC', 'Swing', 'XAMPP'],
    githubUrl: `${BASE}/Hotel-management-system-`,
    featured: false,
  },
  {
    title: 'Babile Hotel System',
    description: `## Overview

A dedicated hotel management solution for Babile — a regional variant of the
hotel management system tailored to local operational requirements and
workflows.

## Key Features

- Localised hotel workflow management
- Room booking and guest record management
- Database-backed CRUD operations

## Technical Highlights

A practical deployment-focused project adapting the core hotel management
architecture to a specific real-world context.`,
    techStack: ['Java', 'MariaDB', 'MySQL', 'JDBC', 'Swing', 'XAMPP'],
    githubUrl: `${BASE}/Babile-Hotel`,
    featured: false,
  },
  {
    title: 'Hotel Management System (VB.NET)',
    description: `## Overview

A Windows Forms desktop application for hotel management built with Visual
Basic .NET. Uses modular database helper modules to separate UI logic from
data access.

## Key Features

- Room booking and availability management
- Guest record management with search and filter
- Billing and invoice generation
- Modular DB helper layer for clean separation of concerns

## Technical Highlights

Showcases Windows Forms UI/UX design principles. The data access layer uses
ADO.NET with parameterised queries — SQL logic stays out of the form code.`,
    techStack: ['Visual Basic .NET', 'Windows Forms', 'ADO.NET', 'MySQL', 'MariaDB', 'Visual Studio'],
    githubUrl: `${BASE}/VB-Hotel-Management`,
    featured: false,
  },
  {
    title: 'Inventory Management (Industrial Practice)',
    description: `## Overview

An industrial practice project implementing inventory management workflows,
built as part of practical coursework at Haramaya University.

## Key Features

- Inventory CRUD operations
- Industrial-practice-grade implementation
- Structured for real-world deployment scenarios

## Technical Highlights

Developed as a formal industrial practice submission, emphasising documentation,
code organisation, and deployment readiness.`,
    techStack: ['Java', 'MySQL', 'MariaDB', 'JDBC'],
    githubUrl: `${BASE}/Inventory-management`,
    featured: false,
  },
  {
    title: 'Inventory Management System (C++)',
    description: `## Overview

A high-performance console-based inventory system in C++ using custom data
structures — no STL containers. Built to demonstrate low-level memory
management and algorithmic thinking.

## Key Features

- Add, update, remove, and search inventory items
- Linked list and array-based storage
- Dynamic memory allocation with manual cleanup
- Command-line menu with input validation

## Technical Highlights

Implements a singly-linked list from scratch for the main item catalogue.
All heap allocations are tracked and freed on exit.`,
    techStack: ['C++', 'Linked Lists', 'Arrays', 'Data Structures', 'Memory Management'],
    githubUrl: `${BASE}/Inventory-Management-System`,
    featured: false,
  },
  {
    title: 'Harari PCC Portal',
    description: `## Overview

A web portal developed for Harari region — a community-facing digital platform
built to serve local administrative or educational needs.

## Key Features

- Community-facing portal interface
- Web-based access to regional resources

## Technical Highlights

A practical example of building locally-relevant digital infrastructure for
Ethiopian regional communities.`,
    techStack: ['JavaScript', 'HTML5', 'CSS3'],
    githubUrl: `${BASE}/harari-pcc-portal`,
    featured: false,
  },
  {
    title: 'Calculator (VB.NET)',
    description: `## Overview

A Visual Basic .NET Windows Forms calculator — my first VB.NET application,
marking the start of desktop GUI development.

## Key Features

- Standard arithmetic operations
- Windows Forms native UI
- Clean, minimal layout

## Technical Highlights

A foundational project demonstrating event-driven programming in VB.NET and
the Windows Forms event model.`,
    techStack: ['Visual Basic .NET', 'Windows Forms', 'Visual Studio'],
    githubUrl: `${BASE}/Calculator`,
    featured: false,
  },
  {
    title: 'AI Studio Photo Editing',
    description: `## Overview

A collection of AI Studio photo editing assets, presets, and workflow files
for AI-assisted photo retouching and enhancement.

## Key Features

- AI Studio photo editing resource files
- Editing presets and workflow configurations

## Technical Highlights

Demonstrates interest and practical application of AI-assisted creative tools
alongside software development skills.`,
    techStack: ['AI Studio', 'Photo Editing'],
    githubUrl: `${BASE}/Ai-studio-photo-editing-`,
    featured: false,
  },
];

// ── Runner ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱  Connecting to MongoDB…');
  await mongoose.connect(env.MONGO_URI);
  console.log('✅  Connected.');

  console.log('🗑   Clearing existing projects…');
  await ProjectModel.deleteMany({});

  console.log(`📦  Inserting ${projects.length} projects…`);
  const inserted = await ProjectModel.insertMany(projects);

  const featured = inserted.filter((p) => p.featured).length;
  console.log(`✅  Seeded successfully — ${inserted.length} total, ${featured} featured:`);
  inserted.forEach((p) =>
    console.log(`    ${p.featured ? '⭐' : '  •'} [${p._id}] ${p.title}`)
  );

  await mongoose.disconnect();
  console.log('🔌  Disconnected. Done.');
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
