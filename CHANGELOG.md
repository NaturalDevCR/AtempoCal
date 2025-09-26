# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.2.1](https://github.com/NaturalDevCR/AtempoCal/compare/v2.2.0...v2.2.1) (2025-01-27)


### Bug Fixes

* fix erratic scroll behavior in WeeklyView when fixedHeight is set ([#scroll-fix](https://github.com/NaturalDevCR/AtempoCal/commit/scroll-fix)) - Improved scroll container initialization, height detection, and content measurement to ensure smooth scrolling from first interaction

## [2.2.0](https://github.com/NaturalDevCR/AtempoCal/compare/v2.1.0...v2.2.0) (2025-09-26)


### Features

* increase bottom padding for worker rows to improve visual spacing ([d19b0f2](https://github.com/NaturalDevCR/AtempoCal/commit/d19b0f242c9ad1dfe9b9b4a44f188b94348866ca))


### Bug Fixes

* resolve all SCSS and Vue warnings ([996433b](https://github.com/NaturalDevCR/AtempoCal/commit/996433b028c0fc897929365d86149571a5910f17))

## [2.1.0](https://github.com/NaturalDevCR/AtempoCal/compare/v2.0.0...v2.1.0) (2025-09-26)


### Features

* add navbar customization slots for left, center, and right sections ([e9981b9](https://github.com/NaturalDevCR/AtempoCal/commit/e9981b953f2b216da5e5528cb170fc272c80cc6f))

## [2.0.0](https://github.com/NaturalDevCR/AtempoCal/compare/v0.2.3...v2.0.0) (2025-09-26)


### ⚠ BREAKING CHANGES

* Removed currentView prop and view switching functionality as calendar now only supports week view
* Migrated from Tailwind CSS v3 to v4 architecture
* Reverted Tailwind CSS from v4 to v3 for compatibility
* Updated to Tailwind CSS v4 with new configuration format
* Complete rewrite focusing on weekly scheduling
* CalendarConfig no longer includes time-grid specific properties for weekly scheduling calendar
* completely rewrite WeeklyView with true vertical event stacking

### Features

* add configurable scroll behavior for AtempoCal component ([249f582](https://github.com/NaturalDevCR/AtempoCal/commit/249f582e782d88afc83dbe2bba915d1750821698))
* add PDF export functionality with landscape orientation and print optimization ([b16b85b](https://github.com/NaturalDevCR/AtempoCal/commit/b16b85bc7896dfa27a289daa6b4d5137cad1bd9f))
* completely rewrite WeeklyView with true vertical event stacking ([e920769](https://github.com/NaturalDevCR/AtempoCal/commit/e9207695b75b6c89cb32f6358f1f69954dcfd3a2))
* enhance delete button styling and add delete buttons to multi-day events ([64873b2](https://github.com/NaturalDevCR/AtempoCal/commit/64873b21527c21dfbe7a09bd53b5193ace8da65f))
* enhance event click data with resource info and date ranges ([57270cb](https://github.com/NaturalDevCR/AtempoCal/commit/57270cbb8b3dd9ab5c9646700ec32110f6653ed4))
* implement proper column-based multi-day event layout algorithm ([0f4acc1](https://github.com/NaturalDevCR/AtempoCal/commit/0f4acc12a585ee644f3e0f0df1a29fe49aed69ef))
* implement proper multi-day events with vertical stacking ([ea3885a](https://github.com/NaturalDevCR/AtempoCal/commit/ea3885ae5255f14d784c1d31d82781c3beb9d7e3))
* implement world-class resource management with overlap prevention ([158a2cf](https://github.com/NaturalDevCR/AtempoCal/commit/158a2cffeeac2166ed4e44532eef19e5f006ee72))
* improve PDF export to print only calendar with light theme ([f3f995a](https://github.com/NaturalDevCR/AtempoCal/commit/f3f995a604588f647d514e5d31602a21a6b5a384))
* improve WeeklyView reactivity and performance\n\n- Implement optimized cache system with version tracking\n- Fix real-time event updates with proper watchers\n- Add Vue 3 best practices with reactive keys\n- Ensure perfect reactivity for event additions/modifications ([d88b4aa](https://github.com/NaturalDevCR/AtempoCal/commit/d88b4aaa058157186d2bc234022a0c31fe09dc84))
* integrate border styling directly into AtempoCal component ([4a88523](https://github.com/NaturalDevCR/AtempoCal/commit/4a88523c7c52e9ba9c4a012448caf145ceee8db2))
* prepare AtempoCal v2.0.0 for npm publication ([68c4ba6](https://github.com/NaturalDevCR/AtempoCal/commit/68c4ba6e6c3d3bf6d71297583752432d00c0b917))
* publish AtempoCal v1.0.0 to npm registry ([c966926](https://github.com/NaturalDevCR/AtempoCal/commit/c9669264665f1c50064e8f2df677b2f37bb58bb9))
* redesign navigation bar and header with Spanish date format ([97374be](https://github.com/NaturalDevCR/AtempoCal/commit/97374bee40a13afea6b3ba80dc6d2b96ee494cb8))
* redesign WeeklyView with vertical event stacking ([f4e6e87](https://github.com/NaturalDevCR/AtempoCal/commit/f4e6e873318d98d6f318f124520adf45523f3a6d))
* update calendar events to September 2025 context ([2391933](https://github.com/NaturalDevCR/AtempoCal/commit/2391933c1b22d4f525decd77fd3918ca1709ceae))
* update event display format to show time ranges for single-day events and title with date range for multi-day events ([d34b5ee](https://github.com/NaturalDevCR/AtempoCal/commit/d34b5ee25828bedbb5c887f94279ea77e25fb624))
* upgrade to Tailwind CSS v4 with @tailwindcss/vite plugin ([ea89195](https://github.com/NaturalDevCR/AtempoCal/commit/ea89195a3aaa854fbc1ed0fb58ab4137316b893f))


### Bug Fixes

* add Quasar framework compatibility with strengthened CSS borders and grid structure ([30c8898](https://github.com/NaturalDevCR/AtempoCal/commit/30c889843d4901c5310e2b44f853c2cfac748cb7))
* comprehensive theme system fixes for dark/light mode ([585fca4](https://github.com/NaturalDevCR/AtempoCal/commit/585fca40756b0b870ab73cdd2f48a5ca60dc5516))
* correct atemporal API usage in Spanish date helpers ([58e57ea](https://github.com/NaturalDevCR/AtempoCal/commit/58e57ea1034087c71bdf593547dd00497b5b14fd))
* implement dynamic event scheduling that varies by week ([07c8bd1](https://github.com/NaturalDevCR/AtempoCal/commit/07c8bd1333b98bfdd699bd1536cafea4a5cb07a1))
* implement proper multi-day event stacking across resources ([af2ffce](https://github.com/NaturalDevCR/AtempoCal/commit/af2ffce4b5dd877948a7cd264eefaacc39653b70))
* improve row height calculation for proper event stacking in WeeklyView ([a0d9ed9](https://github.com/NaturalDevCR/AtempoCal/commit/a0d9ed9fad556eec2d71927b876a33c8807080b6))
* **print:** resolve PDF export white space and landscape orientation issues ([8b5f53e](https://github.com/NaturalDevCR/AtempoCal/commit/8b5f53e483de4c16ccd6433bbe4d39c9bb585fa7))
* **reactivity:** resolve critical event display reactivity issues in WeeklyView ([5ac5fc3](https://github.com/NaturalDevCR/AtempoCal/commit/5ac5fc33df12e5749dac755710fa199eb2fdec77))
* remove unused currentView property and simplify calendar to single week view ([2f4d42c](https://github.com/NaturalDevCR/AtempoCal/commit/2f4d42c474bd6bc568f596b3632cb96caf8c2261))
* remove w-full class causing event overlap in weekly view ([41b8d4f](https://github.com/NaturalDevCR/AtempoCal/commit/41b8d4f35beb72787fd54153540c004bfa390502))
* resolve build and linting issues ([86aa1f6](https://github.com/NaturalDevCR/AtempoCal/commit/86aa1f674f50df50ce43a458e7a5132eb3ffda55))
* resolve critical reactivity issue in AtempoCal ([1da0b41](https://github.com/NaturalDevCR/AtempoCal/commit/1da0b41d02bc37f6a7ff0c55cbedf805c70ff64d))
* resolve CSS loading issue by adding theme variables to demo ([cf29f64](https://github.com/NaturalDevCR/AtempoCal/commit/cf29f640c7205b5aee70b989e3e151f81b72223e))
* resolve ESLint 9.x dependency conflicts and TypeScript errors ([91c7fb8](https://github.com/NaturalDevCR/AtempoCal/commit/91c7fb84a115962355e788c9195a4c15c04eded6))
* resolve event overlapping in weekly view ([57a4a4b](https://github.com/NaturalDevCR/AtempoCal/commit/57a4a4b440f405ae900669f9db20dbe8a9292d93))
* resolve multi-day event overlapping issue in lane assignment ([c2c0ba5](https://github.com/NaturalDevCR/AtempoCal/commit/c2c0ba50b3f036d9508c3313185b586a300e405e))
* resolve multiple critical UI and functionality issues ([0ba0573](https://github.com/NaturalDevCR/AtempoCal/commit/0ba05735e25cb6467922edeb8727c9be0b41c15d))
* resolve NavigationBar button styling by fixing SCSS compilation and imports ([ce3ce0c](https://github.com/NaturalDevCR/AtempoCal/commit/ce3ce0c2679493f8afeabda5d07c10d26825515e))
* resolve Sunday day label and navigation date range issues ([c4dd0da](https://github.com/NaturalDevCR/AtempoCal/commit/c4dd0da2120762879f7c60e9219dcb5749000f66))
* resolve Sunday day label displaying as SAT instead of SUN ([104c7a8](https://github.com/NaturalDevCR/AtempoCal/commit/104c7a8752f1f27db258ac4e6b7fa77314e658a0))
* restructure multi-day event rendering to prevent overlaps ([247e275](https://github.com/NaturalDevCR/AtempoCal/commit/247e275a8b1e178dcf73c14c324baa5145a6ffff))
* revert endOf('day') logic in multi-day event overlap detection ([30e5739](https://github.com/NaturalDevCR/AtempoCal/commit/30e57396bbfe6c03a16d1a249db4e41982890598))
* revert to Tailwind CSS v3 for utility class compatibility ([91983a1](https://github.com/NaturalDevCR/AtempoCal/commit/91983a1ecdf5b7bd27ade757b089aba736a74a6a))
* **ui:** standardize delete button styling across event types ([abf7621](https://github.com/NaturalDevCR/AtempoCal/commit/abf76211ad55768a21604004cb59ad8daeffbffb))
* update Tailwind CSS v4 configuration and PostCSS setup ([8b99633](https://github.com/NaturalDevCR/AtempoCal/commit/8b99633585bd96e8e7a5b6a9d6ec94ba5c988bc7))
* **WeeklyView:** align multi-day events with correct resource rows ([93dc4a4](https://github.com/NaturalDevCR/AtempoCal/commit/93dc4a4f143de2e8090d84f36bcb566747521f88))


* simplify CalendarConfig for weekly scheduling focus ([c9011c7](https://github.com/NaturalDevCR/AtempoCal/commit/c9011c759ffebcd93e640d6ac333c0e509058b1b))

## [1.0.1] - 2024-12-25

### Fixed
- Enhanced CSS compatibility with Quasar framework
- Strengthened grid border declarations with !important rules
- Improved framework isolation with protected box-sizing and display properties
- Fixed alignment issues in Quasar projects
- Added specific CSS rules for day headers and resource rows
- Enhanced visual consistency across different CSS frameworks

### Improved
- Better CSS protection against external framework interference
- More robust styling for grid lines and borders
- Enhanced documentation with Quasar compatibility guidelines

## [1.0.0] - 2024-12-25

### Added
- Complete rewrite of AtempoCal as a weekly scheduling component
- Dark/light theme support with automatic detection
- Worker/resource scheduling with detailed metadata
- Multi-day event support with proper stacking
- Enhanced event display with time ranges and date ranges
- Comprehensive TypeScript support
- Tailwind CSS integration for styling
- Prop-based configuration (removed built-in settings panel)
- Enhanced event click handlers with complete resource information

### Changed
- **BREAKING**: Focused exclusively on weekly calendar view
- **BREAKING**: Removed daily and monthly views
- **BREAKING**: Simplified CalendarConfig interface
- **BREAKING**: Changed event display format (time ranges only for single-day, title + date range for multi-day)
- **BREAKING**: Removed built-in settings panel - all configuration via props
- Updated to Vue 3.4+ with Composition API
- Improved accessibility and responsive design
- Enhanced documentation and examples

### Removed
- **BREAKING**: Daily and monthly calendar views
- **BREAKING**: Built-in configuration panel
- **BREAKING**: Time grid specific configurations (startHour, endHour, slotDuration)
- Legacy Vue 2 support

### Fixed
- Timezone handling with atemporal library
- Event overlap detection and stacking
- Multi-day event date synchronization
- Theme switching consistency
- TypeScript declaration generation

## [1.0.0] - Previous Version

### Added
- Initial release of AtempoCal
- Basic calendar functionality
- Vue 3 support
- TypeScript integration