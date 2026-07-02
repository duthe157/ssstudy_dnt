# Hướng dẫn Quản lý Config Files trong Jenkins

## Tổng quan

Tài liệu này hướng dẫn cách quản lý các file config nhạy cảm (như `default.json`, `production.json`) trong Jenkins thay vì commit vào Git.

## Tại sao cần quản lý config trong Jenkins?

✅ **Bảo mật**: Không commit sensitive data (API keys, passwords, DB credentials) vào Git  
✅ **Linh hoạt**: Dễ dàng thay đổi config cho từng môi trường  
✅ **Tách biệt**: Code và config được quản lý riêng biệt  

---

## Bước 1: Chuẩn bị Config Files

Tạo các file config cho production trên máy local:

### File: `config/default.json`
```json
{
  "app": {
    "name": "SSStudy API",
    "port": 3013,
    "env": "production"
  },
  "database": {
    "host": "your-db-host",
    "port": 27017,
    "name": "ssstudy_production"
  },
  "redis": {
    "host": "your-redis-host",
    "port": 6379
  }
}
```

### File: `config/production.json`
```json
{
  "database": {
    "username": "prod_user",
    "password": "your-secure-password"
  },
  "api": {
    "secret": "your-api-secret-key",
    "keys": {
      "payos": "your-payos-key",
      "aws": "your-aws-key"
    }
  }
}
```

---

## Bước 2: Upload Config Files vào Jenkins

### 2.1. Truy cập Jenkins Credentials

1. Vào Jenkins: `http://YOUR_VPS_IP:8080`
2. Click **"Manage Jenkins"**
3. Click **"Credentials"**
4. Click **(global)** domain
5. Click **"Add Credentials"**

### 2.2. Thêm default.json

1. **Kind**: Chọn `Secret file`
2. **File**: Click **"Choose File"** → chọn `config/default.json`
3. **ID**: `config-default-json` (phải khớp với Jenkinsfile)
4. **Description**: `Production default.json configuration`
5. Click **"Create"**

### 2.3. Thêm production.json

1. Click **"Add Credentials"** lại
2. **Kind**: Chọn `Secret file`
3. **File**: Click **"Choose File"** → chọn `config/production.json`
4. **ID**: `config-production-json` (phải khớp với Jenkinsfile)
5. **Description**: `Production sensitive configuration`
6. Click **"Create"**

### 2.4. Thêm các file khác (nếu cần)

Lặp lại cho các file như:
- `config.js` → ID: `config-js`
- `.env` → ID: `env-file`
- `ecosystem.config.js` → ID: `ecosystem-config-js`

---

## Bước 3: Cấu hình Jenkinsfile

Jenkinsfile đã được update với stage **"Inject Config Files"**:

```groovy
stage('Inject Config Files') {
    steps {
        echo 'Injecting configuration files from Jenkins credentials...'
        script {
            withCredentials([
                file(credentialsId: 'config-default-json', variable: 'DEFAULT_JSON'),
                file(credentialsId: 'config-production-json', variable: 'PRODUCTION_JSON')
            ]) {
                sh '''
                    mkdir -p config
                    cp $DEFAULT_JSON config/default.json
                    cp $PRODUCTION_JSON config/production.json
                    echo "Config files injected successfully:"
                    ls -la config/
                '''
            }
        }
    }
}
```

### Thêm file khác vào Jenkinsfile

Nếu cần thêm file khác, update như sau:

```groovy
withCredentials([
    file(credentialsId: 'config-default-json', variable: 'DEFAULT_JSON'),
    file(credentialsId: 'config-production-json', variable: 'PRODUCTION_JSON'),
    file(credentialsId: 'config-js', variable: 'CONFIG_JS'),
    file(credentialsId: 'env-file', variable: 'ENV_FILE')
]) {
    sh '''
        mkdir -p config
        cp $DEFAULT_JSON config/default.json
        cp $PRODUCTION_JSON config/production.json
        cp $CONFIG_JS config.js
        cp $ENV_FILE .env
    '''
}
```

---

## Bước 4: Update .gitignore

Đảm bảo các file config không được commit vào Git:

```gitignore
# Config files (managed by Jenkins)
config/default.json
config/production.json
config/uat.json
config.js
.env
.env.production
```

---

## Bước 5: Build và Verify

### 5.1. Commit và Push

```bash
git add Jenkinsfile .gitignore
git commit -m "Add config injection from Jenkins credentials"
git push origin sit
```

### 5.2. Build trong Jenkins

1. Vào job **"SSStudy-API-Deploy"**
2. Click **"Build Now"**
3. Xem **Console Output**

### 5.3. Verify trong Console Output

Tìm stage **"Inject Config Files"**, sẽ thấy:

```
[Pipeline] echo
Injecting configuration files from Jenkins credentials...
[Pipeline] withCredentials
Masking supported pattern matches of $DEFAULT_JSON or $PRODUCTION_JSON
[Pipeline] {
[Pipeline] sh
+ mkdir -p config
+ cp **** config/default.json
+ cp **** config/production.json
+ echo Config files injected successfully:
Config files injected successfully:
+ ls -la config/
total 24
drwxr-xr-x 2 jenkins jenkins 4096 Dec 27 14:40 .
drwxr-xr-x 8 jenkins jenkins 4096 Dec 27 14:40 ..
-rw-r--r-- 1 jenkins jenkins 1234 Dec 27 14:40 default.json
-rw-r--r-- 1 jenkins jenkins  567 Dec 27 14:40 production.json
```

---

## Cách hoạt động

### Quy trình Build:

1. **Checkout**: Clone code từ Git (không có config files)
2. **Inject Config**: Copy config files từ Jenkins credentials vào workspace
3. **Build Docker**: Docker build với config files đã inject
4. **Deploy**: Container chạy với config đúng

### Trong Docker Container:

Config files được copy vào image trong quá trình build:

```dockerfile
# Dockerfile
COPY config/ /home/node/config/
COPY package*.json ./
# ...
```

Container sẽ có đầy đủ config files khi chạy.

---

## Quản lý Config cho nhiều môi trường

### Tạo credentials cho từng môi trường:

**Development:**
- ID: `config-default-json-dev`
- ID: `config-development-json`

**UAT:**
- ID: `config-default-json-uat`
- ID: `config-uat-json`

**Production:**
- ID: `config-default-json-prod`
- ID: `config-production-json`

### Update Jenkinsfile với parameters:

```groovy
pipeline {
    agent any
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['development', 'uat', 'production'],
            description: 'Select deployment environment'
        )
    }
    
    stages {
        stage('Inject Config Files') {
            steps {
                script {
                    def configSuffix = params.ENVIRONMENT == 'production' ? 'prod' : params.ENVIRONMENT
                    
                    withCredentials([
                        file(credentialsId: "config-default-json-${configSuffix}", variable: 'DEFAULT_JSON'),
                        file(credentialsId: "config-${params.ENVIRONMENT}-json", variable: 'ENV_JSON')
                    ]) {
                        sh """
                            mkdir -p config
                            cp \$DEFAULT_JSON config/default.json
                            cp \$ENV_JSON config/${params.ENVIRONMENT}.json
                        """
                    }
                }
            }
        }
    }
}
```

---

## Update Config Files

### Khi cần thay đổi config:

1. Vào **Manage Jenkins** → **Credentials**
2. Click vào credential cần update (ví dụ: `config-default-json`)
3. Click **"Update"**
4. Upload file mới
5. Click **"Save"**
6. Build lại job

**Lưu ý**: Không cần restart Jenkins, chỉ cần build lại job.

---

## Troubleshooting

### Lỗi: Credentials not found

```
ERROR: Could not find credentials entry with ID 'config-default-json'
```

**Giải pháp:**
- Kiểm tra ID trong Jenkins Credentials khớp với Jenkinsfile
- Đảm bảo credentials ở scope **Global**

### Lỗi: Permission denied khi copy file

```
cp: cannot create regular file 'config/default.json': Permission denied
```

**Giải pháp:**
```bash
# Fix permissions cho workspace
sudo chown -R jenkins:jenkins /var/lib/jenkins/workspace/
```

### Config files không được inject vào Docker image

**Kiểm tra:**
1. Xem Console Output, stage "Inject Config Files" có chạy không
2. Kiểm tra `ls -la config/` có hiển thị files không
3. Kiểm tra Dockerfile có `COPY config/` không

---

## Best Practices

✅ **Không commit config vào Git**: Luôn thêm vào `.gitignore`  
✅ **Sử dụng descriptive IDs**: `config-default-json` thay vì `config1`  
✅ **Backup configs**: Export và backup config files thường xuyên  
✅ **Rotate secrets**: Thay đổi API keys, passwords định kỳ  
✅ **Least privilege**: Chỉ cho phép admin access Jenkins credentials  
✅ **Audit logs**: Review Jenkins audit logs thường xuyên  

---

## Alternative: Environment Variables

Nếu config đơn giản, có thể dùng environment variables:

```groovy
environment {
    DB_HOST = credentials('db-host')
    DB_PASSWORD = credentials('db-password')
    API_KEY = credentials('api-key')
}

stages {
    stage('Run Container') {
        steps {
            sh '''
                docker run -d \
                    -e DB_HOST=${DB_HOST} \
                    -e DB_PASSWORD=${DB_PASSWORD} \
                    -e API_KEY=${API_KEY} \
                    ${DOCKER_IMAGE}:latest
            '''
        }
    }
}
```

Trong Jenkins Credentials:
- **Kind**: `Secret text`
- **Secret**: giá trị của biến
- **ID**: tên biến (ví dụ: `db-host`)

---

## Kết luận

Bạn đã setup thành công config management trong Jenkins! 🎉

**Workflow:**
1. Upload config files vào Jenkins Credentials
2. Jenkinsfile tự động inject configs khi build
3. Docker image được build với configs đúng
4. Container chạy với production configs

**Security:**
- ✅ Configs không bao giờ commit vào Git
- ✅ Chỉ Jenkins admin có quyền xem/sửa
- ✅ Credentials được encrypt trong Jenkins
- ✅ Logs mask sensitive values
