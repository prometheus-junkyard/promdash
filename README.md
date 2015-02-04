# PromDash

Dashboard builder for Prometheus.

## Testing

[![Build Status](https://travis-ci.org/prometheus/promdash.svg?branch=master)](https://travis-ci.org/prometheus/promdash)

### Ruby

```bash
$ bundle exec rake
```

### Javascript

```bash
$ RAILS_ENV=test bundle exec rake spec:javascript
```

### JSHint
JSHint is run against all pull requests. To shorten the feedback loop, it is recommended that you run JSHint locally.
With [NPM installed](https://docs.npmjs.com/getting-started/installing-node), install and run JSHint:

```bash
$ npm install jshint -g
$ jshint app/assets/javascripts
```

## Deployment

### Development Mode
Install gems:

    bundle

Start the Rails server:

    bundle exec rails s

### Production Mode
In production mode, you need to define a number of environment variables to
configure the database parameters:

    DATABASE_URL="mysql2://username:password@host/database"
    RAILS_ENV="production"

Create a self-contained Ruby environment and precompile assets:

    make build

Run the production server from the bundled environment:

    bin/env bin/bundle exec bin/thin -p $PORT start

### Deployment Checklist

*Before* deploying a new version of PromDash, follow this checklist:

- Study what has changed since the last deployment:
  - Do any migrations need to be performed (`bundle exec rake db:migrate`)?
  - Do any new environment variables need to be set?
  - Did any of the stored dashboard JSON formats change in a backwards-incompatible way?
- To be safe, create a backup of the current PromDash database.
- Do tests pass for the new revision?
- Are there any other particularly risky changes?

*After* deploying a new version:

- Perform a hard refresh in the browser to ensure all loaded assets are up-to-date.
- Test basic functionality as appropriate (Prometheus and Graphite graph settings, etc.).

### Security Considerations

Since we frequently need to display various PromDash views in inline frames, we
disabled Rails' default header `X-Frame-Options: SAMEORIGIN` for all views:

https://github.com/prometheus/promdash/commit/5b1da215296b5316568ad7c8449652f0d7f74ebe

If you are worried about [clickjacking attacks](http://en.wikipedia.org/wiki/Clickjacking),
it is safe to revert this commit as long as you don't need to display dashboards in iframes.
