# Hướng dẫn Build Dự án từ Jenkins trên VPS Ubuntu 22.04

Tài liệu này hướng dẫn chi tiết cách cài đặt và cấu hình Jenkins để build và deploy dự án SSStudy API trên VPS Ubuntu 22.04.

## Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt Jenkins](#cài-đặt-jenkins)
3. [Cấu hình Jenkins](#cấu-hình-jenkins)
4. [Cài đặt Dependencies](#cài-đặt-dependencies)
5. [Tạo Pipeline Job](#tạo-pipeline-job)
6. [Jenkinsfile Configuration](#jenkinsfile-configuration)
7. [Build và Deploy](#build-và-deploy)
8. [Monitoring và Troubleshooting](#monitoring-và-troubleshooting)

---

## Yêu cầu hệ thống

- **OS**: Ubuntu 22.04 LTS
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB)
- **CPU**: Tối thiểu 2 cores
- **Disk**: Tối thiểu 20GB free space
- **Network**: Kết nối internet ổn định

---

## Cài đặt Jenkins

### Bước 1: Update hệ thống

```bash
sudo apt update && sudo apt upgrade -y
```

### Bước 2: Cài đặt Java

Jenkins yêu cầu Java Runtime Environment (JRE). Cài đặt OpenJDK 11:

```bash
# Cài đặt OpenJDK 11
sudo apt install -y openjdk-11-jdk

# Kiểm tra version
java -version
```

Kết quả mong đợi:
```
openjdk version "11.0.x"
OpenJDK Runtime Environment (build 11.0.x)
OpenJDK 64-Bit Server VM (build 11.0.x)
```

### Bước 3: Thêm Jenkins Repository

```bash
# Download và thêm Jenkins GPG key
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# Thêm Jenkins repository vào sources list
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
```

### Bước 4: Cài đặt Jenkins

```bash
# Update package index
sudo apt update

# Cài đặt Jenkins
sudo apt install -y jenkins

# Start Jenkins service
sudo systemctl start jenkins

# Enable Jenkins để tự động start khi boot
sudo systemctl enable jenkins

# Kiểm tra status
sudo systemctl status jenkins
```

### Bước 5: Cấu hình Firewall

```bash
# Mở port 8080 cho Jenkins
sudo ufw allow 8080

# Nếu chưa enable firewall
sudo ufw enable

# Kiểm tra status
sudo ufw status
```

### Bước 6: Truy cập Jenkins Web Interface

1. Mở browser và truy cập: `http://YOUR_VPS_IP:8080`

2. Lấy initial admin password:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

3. Copy password và paste vào Jenkins unlock screen

4. Chọn **"Install suggested plugins"**

5. Đợi plugins cài đặt xong (khoảng 5-10 phút)

6. Tạo Admin User:
   - Username: admin (hoặc tên bạn muốn)
   - Password: [mật khẩu mạnh]
   - Full name: Administrator
   - Email: your-email@example.com

7. Cấu hình Jenkins URL (giữ mặc định hoặc thay đổi nếu cần)

8. Click **"Start using Jenkins"**

---

## Cài đặt Dependencies

### Bước 1: Cài đặt Node.js 14.x

```bash
# Thêm NodeSource repository cho Node.js 14.x
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -

# Cài đặt Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should output: v14.x.x
npm --version   # Should output: 6.x.x
```

### Bước 2: Cài đặt PM2

```bash
# Cài đặt PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version

# Setup PM2 startup script
pm2 startup systemd

# Copy và chạy command được generate (ví dụ):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u jenkins --hp /var/lib/jenkins
```

### Bước 3: Cài đặt Git

```bash
# Cài đặt Git
sudo apt install -y git

# Verify installation
git --version
```

### Bước 4: Cài đặt Docker (Optional - nếu build với Docker)

```bash
# Cài đặt Docker
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Verify Docker
sudo docker --version
```

### Bước 5: Tạo thư mục Deploy

```bash
# Tạo thư mục cho deployment
sudo mkdir -p /home/deploy/api-luyenthitiendat

# Set ownership cho jenkins user
sudo chown -R jenkins:jenkins /home/deploy/

# Set permissions
sudo chmod -R 755 /home/deploy/
```

---

## Cấu hình Jenkins

### Bước 1: Cài đặt Jenkins Plugins

1. Vào **Manage Jenkins** → **Manage Plugins**
2. Chọn tab **Available plugins**
3. Tìm và cài đặt các plugins sau:

**Essential Plugins:**
- ✅ **NodeJS Plugin** - Build Node.js projects
- ✅ **Git Plugin** - Git integration
- ✅ **Pipeline Plugin** - Pipeline support
- ✅ **Credentials Plugin** - Manage credentials
- ✅ **SSH Agent Plugin** - SSH deployment
- ✅ **Docker Pipeline Plugin** - Docker build support (nếu dùng Docker)
- ✅ **Timestamper** - Add timestamps to console output
- ✅ **AnsiColor** - Colorize console output

4. Click **"Install without restart"** hoặc **"Download now and install after restart"**

5. Restart Jenkins nếu cần:
```bash
sudo systemctl restart jenkins
```

### Bước 2: Cấu hình NodeJS Tool

1. Vào **Manage Jenkins** → **Global Tool Configuration**

2. Scroll xuống phần **NodeJS**

3. Click **"Add NodeJS"**

4. Cấu hình:
   - **Name**: `NodeJS-14.19.1`
   - **Install automatically**: ✅ Checked
   - **Version**: Chọn `NodeJS 14.19.1`
   - **Global npm packages to install**: `pm2`

5. Click **"Save"**

### Bước 3: Thêm Git Credentials

#### Option 1: Username/Password (HTTPS)

1. Vào **Manage Jenkins** → **Manage Credentials**
2. Click vào **(global)** domain
3. Click **"Add Credentials"**
4. Cấu hình:
   - **Kind**: `Username with password`
   - **Scope**: `Global`
   - **Username**: Git username của bạn
   - **Password**: Git password hoặc Personal Access Token
   - **ID**: `git-credentials`
   - **Description**: `Git Repository Credentials`
5. Click **"Create"**

#### Option 2: SSH Key (SSH)

1. Tạo SSH key trên Jenkins server:
```bash
# Switch to jenkins user
sudo su - jenkins

# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "jenkins@yourdomain.com"
# Press Enter để sử dụng default location
# Không cần passphrase (press Enter)

# Copy public key
cat ~/.ssh/id_rsa.pub
```

2. Thêm public key vào Git repository (GitHub/GitLab/Bitbucket)

3. Trong Jenkins:
   - **Kind**: `SSH Username with private key`
   - **Scope**: `Global`
   - **ID**: `git-ssh-credentials`
   - **Username**: `git`
   - **Private Key**: Chọn "Enter directly" và paste nội dung của `~/.ssh/id_rsa`
   - Click **"Create"**

### Bước 4: Cấu hình Environment Variables (Optional)

1. Vào **Manage Jenkins** → **Configure System**

2. Scroll xuống phần **Global properties**

3. Check **"Environment variables"**

4. Thêm các biến:
   - `DEPLOY_PATH` = `/home/deploy/api-luyenthitiendat`
   - `APP_NAME` = `api-luyenthitiendat`
   - `NODE_ENV` = `production`

5. Click **"Save"**

---

## Tạo Pipeline Job

### Bước 1: Tạo New Item

1. Vào Jenkins Dashboard
2. Click **"New Item"**
3. Nhập tên: `SSStudy-API-Deploy`
4. Chọn **"Pipeline"**
5. Click **"OK"**

### Bước 2: Cấu hình General Settings

1. **Description**: `Build and deploy SSStudy API to production`

2. **Build Triggers** (chọn một hoặc nhiều):
   - ✅ **GitHub hook trigger for GITScm polling** (nếu dùng GitHub webhooks)
   - ✅ **Poll SCM**: `H/5 * * * *` (check mỗi 5 phút)
   - ✅ **Build periodically**: `H 2 * * *` (build hàng ngày lúc 2AM)

### Bước 3: Cấu hình Pipeline

#### Option 1: Pipeline script from SCM (Recommended)

1. **Definition**: Chọn `Pipeline script from SCM`

2. **SCM**: Chọn `Git`

3. **Repositories**:
   - **Repository URL**: URL của Git repository
     - HTTPS: `https://github.com/username/repo.git`
     - SSH: `git@github.com:username/repo.git`
   - **Credentials**: Chọn credentials đã tạo ở bước trước

4. **Branches to build**:
   - **Branch Specifier**: `*/sit` (hoặc branch bạn muốn deploy)

5. **Script Path**: `Jenkinsfile`

6. Click **"Save"**

#### Option 2: Pipeline script (Direct)

Nếu muốn viết script trực tiếp trong Jenkins:

1. **Definition**: Chọn `Pipeline script`
2. Paste Jenkinsfile content vào **Script** box
3. Click **"Save"**

---

## Jenkinsfile Configuration

Tạo file `Jenkinsfile` tại root của repository với nội dung sau:

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-14.19.1'
    }
    
    environment {
        APP_NAME = 'api-luyenthitiendat'
        DEPLOY_PATH = '/home/deploy/api-luyenthitiendat'
        NODE_ENV = 'production'
        PM2_APP_NAME = 'api-luyenthitiendat'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                sh '''
                    node --version
                    npm --version
                    npm ci --production --no-audit --no-fund || npm install --production --no-audit --no-fund
                '''
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building application...'
                sh '''
                    # Create build directory
                    mkdir -p build_temp
                    
                    # Copy necessary files
                    cp -r app/ config/ db/ scripts/ build_temp/ 2>/dev/null || true
                    cp package*.json app.js ecosystem.config.js jsconfig.json build_temp/ 2>/dev/null || true
                    cp -r node_modules build_temp/ 2>/dev/null || true
                    
                    # Create tarball
                    tar -czf ${APP_NAME}-${BUILD_NUMBER}.tar.gz -C build_temp .
                    
                    # Cleanup
                    rm -rf build_temp
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                sh '''
                    # Backup current deployment
                    if [ -d ${DEPLOY_PATH} ]; then
                        rm -rf ${DEPLOY_PATH}.backup || true
                        cp -r ${DEPLOY_PATH} ${DEPLOY_PATH}.backup || true
                    fi
                    
                    # Create deploy directory
                    mkdir -p ${DEPLOY_PATH}
                    
                    # Extract new version
                    tar -xzf ${APP_NAME}-${BUILD_NUMBER}.tar.gz -C ${DEPLOY_PATH}
                    
                    # Set permissions
                    chmod -R 755 ${DEPLOY_PATH}
                '''
            }
        }
        
        stage('Start Application') {
            steps {
                echo 'Starting application with PM2...'
                sh '''
                    cd ${DEPLOY_PATH}
                    
                    # Stop existing PM2 process if running
                    pm2 stop ${PM2_APP_NAME} || true
                    pm2 delete ${PM2_APP_NAME} || true
                    
                    # Start application
                    NODE_ENV=${NODE_ENV} pm2 start ecosystem.config.js --env production
                    
                    # Save PM2 configuration
                    pm2 save
                    
                    # Show status
                    pm2 list
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                sh '''
                    # Wait for application to start
                    sleep 5
                    
                    # Check if PM2 process is running
                    pm2 list | grep ${PM2_APP_NAME} | grep online || exit 1
                    
                    # Optional: Check HTTP endpoint
                    # curl -f http://localhost:3013/health || exit 1
                    
                    echo "Application is running successfully!"
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Deployment completed successfully! ✅'
            sh 'pm2 logs ${PM2_APP_NAME} --lines 20 --nostream'
        }
        
        failure {
            echo 'Deployment failed! ❌'
            sh '''
                # Rollback to previous version if exists
                if [ -d ${DEPLOY_PATH}.backup ]; then
                    echo "Rolling back to previous version..."
                    rm -rf ${DEPLOY_PATH}
                    mv ${DEPLOY_PATH}.backup ${DEPLOY_PATH}
                    cd ${DEPLOY_PATH}
                    pm2 restart ${PM2_APP_NAME} || pm2 start ecosystem.config.js --env production
                    pm2 save
                fi
            '''
        }
        
        always {
            echo 'Cleaning up build artifacts...'
            sh 'rm -f ${APP_NAME}-${BUILD_NUMBER}.tar.gz || true'
        }
    }
}
```

### Jenkinsfile với Docker Build (Alternative)

Nếu bạn muốn build và deploy bằng Docker:

```groovy
pipeline {
    agent any
    
    environment {
        APP_NAME = 'api-luyenthitiendat'
        DOCKER_IMAGE = 'ssstudy-api'
        DOCKER_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'ssstudy-api-container'
        HOST_PORT = '3013'
        CONTAINER_PORT = '3013'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh '''
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                '''
            }
        }
        
        stage('Stop Old Container') {
            steps {
                echo 'Stopping old container...'
                sh '''
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                '''
            }
        }
        
        stage('Run New Container') {
            steps {
                echo 'Running new container...'
                sh '''
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${HOST_PORT}:${CONTAINER_PORT} \
                        --restart unless-stopped \
                        -e NODE_ENV=production \
                        ${DOCKER_IMAGE}:latest
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                sh '''
                    sleep 5
                    docker ps | grep ${CONTAINER_NAME} || exit 1
                    # curl -f http://localhost:${HOST_PORT}/health || exit 1
                    echo "Container is running successfully!"
                '''
            }
        }
        
        stage('Cleanup Old Images') {
            steps {
                echo 'Cleaning up old Docker images...'
                sh '''
                    docker image prune -f
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Docker deployment completed successfully! ✅'
            sh 'docker logs ${CONTAINER_NAME} --tail 20'
        }
        
        failure {
            echo 'Docker deployment failed! ❌'
            sh 'docker logs ${CONTAINER_NAME} --tail 50 || true'
        }
    }
}
```

---

## Build và Deploy

### Bước 1: Trigger Build thủ công

1. Vào Jenkins Dashboard
2. Click vào job **"SSStudy-API-Deploy"**
3. Click **"Build Now"**
4. Xem progress trong **Build History**
5. Click vào build number để xem **Console Output**

### Bước 2: Xem Build Logs

```
Console Output sẽ hiển thị:
- Checkout source code
- Install dependencies
- Build application
- Deploy to server
- Start PM2
- Health check results
```

### Bước 3: Kiểm tra Deployment

SSH vào VPS và kiểm tra:

```bash
# Check PM2 status
pm2 list

# Check application logs
pm2 logs api-luyenthitiendat --lines 50

# Check if application is responding
curl http://localhost:3013

# Check process
ps aux | grep node

# Check port
sudo netstat -tulpn | grep 3013
```

### Bước 4: Setup Webhook (Optional)

Để tự động trigger build khi có push/merge vào repository:

#### GitHub Webhook:

1. Vào GitHub repository → **Settings** → **Webhooks**
2. Click **"Add webhook"**
3. **Payload URL**: `http://YOUR_JENKINS_IP:8080/github-webhook/`
4. **Content type**: `application/json`
5. **Events**: Chọn "Just the push event"
6. Click **"Add webhook"**

#### GitLab Webhook:

1. Vào GitLab repository → **Settings** → **Webhooks**
2. **URL**: `http://YOUR_JENKINS_IP:8080/project/SSStudy-API-Deploy`
3. **Trigger**: Check "Push events"
4. **Branch filter**: `sit` (hoặc branch bạn muốn)
5. Click **"Add webhook"**

---

## Monitoring và Troubleshooting

### Jenkins Logs

```bash
# View Jenkins logs
sudo journalctl -u jenkins -f

# View Jenkins system log
sudo tail -f /var/log/jenkins/jenkins.log

# View specific job log
tail -f /var/lib/jenkins/jobs/SSStudy-API-Deploy/builds/lastBuild/log
```

### Common Issues

#### 1. Build Failed - npm install errors

**Lỗi:**
```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

**Giải pháp:**
```bash
# Trong Jenkinsfile, thêm cleanup step
sh 'rm -rf node_modules package-lock.json'
sh 'npm cache clean --force'
sh 'npm install --production'
```

#### 2. Permission Denied

**Lỗi:**
```
Permission denied: /home/deploy/api-luyenthitiendat
```

**Giải pháp:**
```bash
# Fix permissions
sudo chown -R jenkins:jenkins /home/deploy/
sudo chmod -R 755 /home/deploy/

# Add jenkins to necessary groups
sudo usermod -aG www-data jenkins
sudo systemctl restart jenkins
```

#### 3. PM2 Command Not Found

**Lỗi:**
```
pm2: command not found
```

**Giải pháp:**
```bash
# Install PM2 globally
sudo npm install -g pm2

# Add PM2 to PATH trong Jenkinsfile
environment {
    PATH = "/usr/local/bin:${env.PATH}"
}
```

#### 4. Port Already in Use

**Lỗi:**
```
Error: listen EADDRINUSE: address already in use :::3013
```

**Giải pháp:**
```bash
# Find and kill process using port
sudo lsof -ti:3013 | xargs kill -9

# Or restart PM2
pm2 restart api-luyenthitiendat
```

#### 5. Git Clone Failed

**Lỗi:**
```
Failed to connect to repository
```

**Giải pháp:**
```bash
# Test Git connection as jenkins user
sudo su - jenkins
git clone YOUR_REPO_URL

# Check SSH key
ssh -T git@github.com

# Check credentials in Jenkins
# Manage Jenkins → Manage Credentials
```

### Performance Monitoring

```bash
# Monitor Jenkins performance
htop

# Check disk space
df -h

# Check memory usage
free -m

# Monitor PM2 processes
pm2 monit

# View PM2 logs in real-time
pm2 logs api-luyenthitiendat --lines 100
```

### Backup và Recovery

#### Backup Jenkins Configuration

```bash
# Backup entire Jenkins home
sudo tar -czf jenkins-backup-$(date +%Y%m%d).tar.gz /var/lib/jenkins/

# Backup specific job
sudo tar -czf job-backup-$(date +%Y%m%d).tar.gz /var/lib/jenkins/jobs/SSStudy-API-Deploy/

# Copy to safe location
sudo mv jenkins-backup-*.tar.gz /backup/
```

#### Restore Jenkins

```bash
# Stop Jenkins
sudo systemctl stop jenkins

# Restore from backup
sudo tar -xzf jenkins-backup-YYYYMMDD.tar.gz -C /

# Fix permissions
sudo chown -R jenkins:jenkins /var/lib/jenkins/

# Start Jenkins
sudo systemctl start jenkins
```

### Rollback Deployment

Nếu deployment có vấn đề:

```bash
# Manual rollback
cd /home/deploy/
rm -rf api-luyenthitiendat
mv api-luyenthitiendat.backup api-luyenthitiendat
cd api-luyenthitiendat
pm2 restart api-luyenthitiendat
pm2 save
```

---

## Security Best Practices

### 1. Firewall Configuration

```bash
# Only allow necessary ports
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 8080/tcp    # Jenkins (restrict to specific IPs)
sudo ufw allow 3013/tcp    # Application (if public)

# Restrict Jenkins to specific IP
sudo ufw delete allow 8080
sudo ufw allow from YOUR_IP to any port 8080

sudo ufw enable
sudo ufw status numbered
```

### 2. Setup HTTPS for Jenkins

```bash
# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/jenkins
```

Nginx config:
```nginx
server {
    listen 80;
    server_name jenkins.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/jenkins /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d jenkins.yourdomain.com
```

### 3. Jenkins Security Settings

1. **Enable CSRF Protection**:
   - Manage Jenkins → Configure Global Security
   - Check "Prevent Cross Site Request Forgery exploits"

2. **Setup Authorization**:
   - Use "Matrix-based security"
   - Give admin full permissions
   - Restrict anonymous access

3. **Regular Updates**:
```bash
# Update Jenkins
sudo apt update
sudo apt upgrade jenkins

# Update plugins via UI
# Manage Jenkins → Manage Plugins → Updates
```

---

## Maintenance Tasks

### Daily Tasks

```bash
# Check Jenkins status
sudo systemctl status jenkins

# Check disk space
df -h /var/lib/jenkins

# Check PM2 processes
pm2 list
```

### Weekly Tasks

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean old builds (keep last 10)
# Configure in Jenkins job: Discard old builds

# Review logs
pm2 logs api-luyenthitiendat --lines 1000 > /tmp/app-logs-$(date +%Y%m%d).log
```

### Monthly Tasks

```bash
# Backup Jenkins
sudo tar -czf /backup/jenkins-$(date +%Y%m%d).tar.gz /var/lib/jenkins/

# Update Jenkins plugins
# Manage Jenkins → Manage Plugins → Updates → Select All → Download and Install

# Review and rotate logs
sudo journalctl --vacuum-time=30d
```

---

## Kết luận

Bạn đã hoàn thành việc setup Jenkins để build và deploy dự án SSStudy API trên Ubuntu 22.04. 

**Checklist hoàn thành:**
- ✅ Jenkins đã được cài đặt và cấu hình
- ✅ Node.js, PM2, Git đã được cài đặt
- ✅ Pipeline job đã được tạo
- ✅ Jenkinsfile đã được cấu hình
- ✅ Build và deploy tự động hoạt động
- ✅ Monitoring và logging đã được setup
- ✅ Security best practices đã được áp dụng

**Next Steps:**
1. Setup webhook để tự động build khi có code mới
2. Thêm automated tests vào pipeline
3. Setup notification (email, Slack) khi build fail/success
4. Implement blue-green deployment hoặc canary deployment
5. Setup monitoring với Prometheus + Grafana

**Tài liệu tham khảo:**
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

Nếu có vấn đề gì, tham khảo phần [Troubleshooting](#monitoring-và-troubleshooting) hoặc liên hệ team DevOps.
