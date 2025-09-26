# Changelog

All notable changes to this project will be documented in this file.
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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