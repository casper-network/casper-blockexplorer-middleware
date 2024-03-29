# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2023-06-22

### Added

- Web sockets architecture using NestJS gateway service
- Live updates for blocks, validators and peers data using web sockets
- Sidecar integration for specific modules

## [1.3.0] - 2023-05-08

### Added

- Updated architecture from Express to NestJS
- Implemented better performing cache modules
- Added endpoint for versioning and git hash
- Setup specific endpoint for `/balance`
- Dependency cleanup

## [1.2.0] - 2023-03-08

### Added

- Added validators endpoint with filters
- Added pagination to peers

### Fixed

- Fixed performance issues

## [1.1.0] - 2023-01-26

### Added

- Support for SSE Sidecar (`SIDECAR_REST_URL` & `SIDECAR_EVENTSTREAM_URL` required to enable it)
- New `/peers` endpoint providing peers statuses (hash of last added block, uptime, ip)
- New endpoints: `/latest-block`, `/block/:hashOrHeight`, `/status`, `/blocks`, `/deploy/:hash`, `/account/:accountHashOrPublicKey`
- When it's possible, all of the endpoint support both Sidecar as well as RPC
- Added cache so number of RPC request is minimized

## [1.0.0] - 2022-10-13

### Added

- Proxy layer that supports list of nodes in case one of them will be dead
- Basic tests
