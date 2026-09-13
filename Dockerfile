# Stage 1: Install Composer dependencies
FROM php:8.2-cli-alpine AS composer_builder
WORKDIR /app
COPY composer.json composer.lock ./
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Stage 2: Build React frontend
FROM node:20-alpine AS frontend_builder
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 3: PHP-FPM application container
FROM php:8.2-fpm-alpine AS app

# Install system dependencies and PHP PostgreSQL extensions
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_pgsql pgsql bcmath zip opcache intl gd

WORKDIR /var/www/html

# Copy backend source code
COPY . /var/www/html

# Copy production vendor directory
COPY --from=composer_builder /app/vendor /var/www/html/vendor

# Copy compiled frontend dist into public directory
COPY --from=frontend_builder /app/client/dist /var/www/html/public

# Ensure correct permissions for Laravel storage and cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]

# Stage 4: Nginx web server container
FROM nginx:alpine AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=app /var/www/html/public /var/www/html/public
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
