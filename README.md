# Pylontech HV Card

A modern Lovelace card for Home Assistant, designed for **Pylontech high-voltage battery systems** and the [Pylontech HV BMS integration](https://github.com/BlueIceWolf/home-assistant-pylontech-hv).

The card provides a clean overview of the battery state, power flow, cell health and BMS warnings without filling the dashboard with dozens of individual entities.

## Features

- State of charge overview
- Battery voltage and current
- Charge / discharge power
- Pack temperature
- Minimum and maximum cell voltage
- Cell voltage difference
- Minimum and maximum cell temperature
- Temperature difference
- Integrated warning display
- Optional BMU overview
- Optional cell details
- Automatic discovery of related entities from the selected Pylontech device
- Home Assistant theme support
- Responsive layout
- No Mushroom dependency required

## Requirements

- Home Assistant
- [Pylontech HV BMS](https://github.com/BlueIceWolf/home-assistant-pylontech-hv)

## Installation

### HACS

1. Open HACS.
2. Add this repository as a custom repository.
3. Select **Dashboard** as the category.
4. Install **Pylontech HV Card**.
5. Reload the browser if necessary.

## Basic configuration

```yaml
type: custom:pylontech-hv-card
entity: sensor.pylontech_bms_battery
```

The selected entity is used as an anchor. The card automatically discovers other entities belonging to the same Home Assistant device.

## Options

```yaml
type: custom:pylontech-hv-card
entity: sensor.pylontech_bms_battery
name: Pylontech HV BMS
show_modules: true
show_cells: false
show_diagnostics: true
```

| Option | Default | Description |
| --- | --- | --- |
| `entity` | required | Anchor entity from the Pylontech BMS device |
| `name` | `Pylontech HV BMS` | Card title |
| `show_modules` | `true` | Show BMU overview |
| `show_cells` | `false` | Show individual cell voltages |
| `show_diagnostics` | `true` | Show diagnostics and warning state |

## Companion integration

This card is primarily developed for:

[Pylontech HV BMS for Home Assistant](https://github.com/BlueIceWolf/home-assistant-pylontech-hv)

The integration currently supports the Pylontech SC0500 / XHB_CMU_H7 family and provides pack, BMU, cell and diagnostic entities.

## Development status

This project is currently in early development. Entity discovery and layouts may still change before version 1.0.

## License

MIT
