FROM mcr.microsoft.com/playwright:v1.64.0-noble

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openjdk-17-jre-headless socat \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g allure-commandline

COPY package*.json ./

RUN npm ci

COPY . .

RUN java -version && allure --version

ENV BASE_URL=http://host.docker.internal:3000 \
    API_BASE_URL=http://host.docker.internal:4000

# The React app calls the API at localhost:4000 from the browser.
# Forward that port to the host so it works inside the container.
CMD ["sh", "-c", "socat TCP-LISTEN:4000,bind=0.0.0.0,fork,reuseaddr TCP:host.docker.internal:4000 & socat TCP6-LISTEN:4000,bind=::,ipv6only=1,fork,reuseaddr TCP:host.docker.internal:4000 & npm run test:report"]
