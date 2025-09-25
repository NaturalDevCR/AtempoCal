# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-25

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