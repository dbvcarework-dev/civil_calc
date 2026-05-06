# Civil Design Web App
This app is used for RCC beam design, tank foundation design, and wind load calculation.
Tech stack:
- React
- Node.js
- Express
- PostgreSQL

## Prerequisites
1. Node.js v20.20.1 (or higher)
2. PostgreSQL v18 (or higher)

## Setup
1. Download project
2. Extract zip
3. Open terminal

## Install
cd server
npm install
cd client
npm install

## Run
Frontend:
--cd client
--npm run dev
Backend:
--cd server
--node index.js

## Database Setup
1. Install PostgreSQL
2. Create database:
CREATE DATABASE db_name;
3. Restore backup:
psql -U postgres -p 5433 -d db_name -f first_db_backup.sql


## Default Inputs For Beam Design
beamName: 'B1', bendingMomentDirection: '',
    Mu: '1500', Vu: '940', cover: '77.5', fck: '30', fy: '500',
    b: '500', D: '1000',
    bar1Count: '4', bar1Dia: '32', bar2Count: '3', bar2Dia: '25',
    stirrupDia: '10', stirrupLegs: '4', providedStirrupSpacing: '150',
    sfrCount: '3', sfrDia: '12',
    tcRatio1: '0.75', tcRatio2: '1.00',

## Default Inputs For Tank Foundation Design
tankName: 'Tank 1', tankID: '11.80', bcd: '12.00', totalHeightEqpt: '12.80', liquidLevel: '12.50',
    waterDensity: '10.00', liquidDensity: '10.00',
    emptyWtTank: '530.00', operatingWtTank: '12429.00', hydrotestWtTank: '14664.00',
    tankBottomPlateThk: '8.00', thkSandBitumen: '0.05', thkM30Conc: '0.15', thkM75Conc: '0.075',
    heightRBAboveGL: '1.0', depthRBBelowGL: '1.40', depthFdnRaft: '0.60',
    thkRingBeamWall: '0.40', widthRingBeamRaft: '2.00',
    sbcAtFdnDepth: '190.00', Ka: '0.36', mu: '0.30',
    unitWtConcrete: '25.00', unitWtSand: '18.00', unitWtSoil: '18.00',
    fck: '30.00', fy: '500.00',
    windFx: '416.00', windM: '2656.00', seismicFx: '1477.00', seismicM: '9430.00',
    barDia_horiz: '12', barDia_vert: '12', raftBarDia: '12'

## Default Inputs For Wind Load Calculation
 projectName: '',
    H: '22',
    W: '20',
    L: '31.11',
    city: 'Vadodara',
    designLife: '50',
    structureType: 'General',
    terrainCategory: '2',
    k2Custom: null,
    k3Type: 'flat',
    k3Custom: null,
    k4Type: 'normal',
    kd: 'rectangular',
    kcType: '2',
    cpi: '0.7',   // "More than 20% openings"
    cpeA: '0.7',
    cpeB: '-0.3',
    cpeC: '-0.7',
    cpeD: '-0.7',



