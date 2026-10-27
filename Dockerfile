# MKP revamp: static site served by nginx.
# The site lives in site/, NOT in the repo root, so only that folder is copied.
FROM nginx:1.27-alpine

# Remove nginx's default "Welcome to nginx!" page and default config
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/mkp.conf
COPY site/ /usr/share/nginx/html/

EXPOSE 80
