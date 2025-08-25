# Deployment Security Headers

To harden production deployments, serve the application with the following HTTP headers and Content Security Policy (CSP).

## Nginx
```
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://nftapi.cyberwiz.io https://api.bigdatacloud.net https://geo.fcc.gov https://api.census.gov https://tigerweb.geo.census.gov https://gis.water.ca.gov https://services.arcgis.com https://overpass-api.de https://api.weather.gov https://maps.googleapis.com; img-src 'self' https://maps.googleapis.com data:";
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;
```

## Apache
```
<IfModule mod_headers.c>
  Header set Content-Security-Policy "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://nftapi.cyberwiz.io https://api.bigdatacloud.net https://geo.fcc.gov https://api.census.gov https://tigerweb.geo.census.gov https://gis.water.ca.gov https://services.arcgis.com https://overpass-api.de https://api.weather.gov https://maps.googleapis.com; img-src 'self' https://maps.googleapis.com data:" 
  Header set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
  Header set X-Frame-Options "DENY"
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "no-referrer"
</IfModule>
```

Adjust domains as needed for additional external resources.
