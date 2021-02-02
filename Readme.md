# Prisma Tutorial - Practise Project

## Install

1. Fork & Clone this repository
1. Create Database `db_prisma_tutorial` in your Local or Cloud Postgresql Database.
1. Copy `.env.example` to `.env` and change the `DATABASE_URL` environment variable to your Postgresql Database Url.
1. Run `npm install`
1. Optionally, Remove `20210202112016_create_schema` folder from `prisma/migrations/`
1. Run below commands

```bash
npm run migrate -- --name create-schema
npm run generate
```

## Usage

### Prisma Studio

```bash
npm run studio
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```
