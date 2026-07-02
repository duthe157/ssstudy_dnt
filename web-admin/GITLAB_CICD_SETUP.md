# GitLab CI/CD Setup cho Deploy lên AWS S3

## Tổng quan
Pipeline này sẽ tự động build React app và deploy lên AWS S3 khi có merge vào nhánh `prod`.

## Cấu hình GitLab Variables

Để pipeline hoạt động, bạn cần setup các environment variables sau trong GitLab:

### 1. Truy cập GitLab Project Settings
- Vào project GitLab của bạn
- Chọn **Settings** > **CI/CD**
- Mở rộng section **Variables**

### 2. Thêm các Variables sau:

| Variable Name | Value | Protected | Masked | Description |
|---------------|-------|-----------|---------|-------------|
| `BUCKETS_NAME` | `your-s3-bucket-name` | ✅ | ❌ | Tên S3 bucket |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | ✅ | ✅ | AWS Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | `your-secret-key` | ✅ | ✅ | AWS Secret Access Key |

### 3. Cách thêm Variables:
1. Click **Add variable**
2. Nhập **Key** (tên variable)
3. Nhập **Value** (giá trị)
4. Chọn **Protected** = `true` (chỉ chạy trên protected branches)
5. Chọn **Masked** = `true` cho sensitive data (AWS keys)
6. Click **Add variable**

## AWS S3 Bucket Setup

### 1. Tạo S3 Bucket
```bash
# Tạo bucket (thay your-bucket-name)
aws s3 mb s3://your-bucket-name --region us-east-1
```

### 2. Cấu hình Static Website Hosting
```bash
# Enable static website hosting
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
```

### 3. Cấu hình Bucket Policy (Public Access)
Tạo file `bucket-policy.json`:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

Áp dụng policy:
```bash
aws s3api put-bucket-policy --bucket your-bucket-name --policy file://bucket-policy.json
```

## AWS IAM User Setup

### 1. Tạo IAM User cho CI/CD
```bash
aws iam create-user --user-name gitlab-ci-s3-deploy
```

### 2. Tạo và attach policy
Tạo file `s3-deploy-policy.json`:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

```bash
# Tạo policy
aws iam create-policy --policy-name S3DeployPolicy --policy-document file://s3-deploy-policy.json

# Attach policy to user
aws iam attach-user-policy --user-name gitlab-ci-s3-deploy --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/S3DeployPolicy
```

### 3. Tạo Access Keys
```bash
aws iam create-access-key --user-name gitlab-ci-s3-deploy
```

Lưu lại `AccessKeyId` và `SecretAccessKey` để setup trong GitLab Variables.

## Pipeline Flow

### 1. Build Stage
- Sử dụng Node.js 16.20.1
- Install dependencies với `npm ci`
- Build React app với `npm run build`
- Lưu artifacts (thư mục build/) cho stage tiếp theo

### 2. Deploy Stage
- Sử dụng AWS CLI image
- Sync toàn bộ thư mục build/ lên S3
- Cấu hình cache headers:
  - Static files (CSS, JS): cache 1 năm
  - index.html: không cache
- Xóa files cũ không còn sử dụng (`--delete`)

## Trigger Conditions

Pipeline chỉ chạy khi:
- ✅ Merge/Push vào nhánh `prod`
- ❌ Không chạy trên các nhánh khác

## Monitoring

### Logs
- Vào **CI/CD** > **Pipelines** để xem logs
- Check từng stage để debug nếu có lỗi

### Website URL
Sau khi deploy thành công, website sẽ có URL:
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

## Troubleshooting

### 1. Build Failed
- Check Node.js version
- Check dependencies trong package.json
- Check build script

### 2. Deploy Failed
- Verify AWS credentials
- Check S3 bucket name
- Check bucket permissions
- Check AWS region

### 3. Website không load
- Check bucket policy (public access)
- Check static website hosting enabled
- Check index.html tồn tại

## Security Notes

⚠️ **Quan trọng:**
- Không commit AWS credentials vào code
- Sử dụng GitLab Variables để lưu sensitive data
- Chỉ cho phép pipeline chạy trên protected branches
- Regularly rotate AWS access keys
- Monitor AWS CloudTrail logs

## Advanced Features

### 1. CloudFront Integration
Để cải thiện performance, có thể setup CloudFront:
```bash
# Tạo CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### 2. Custom Domain
Setup Route 53 để sử dụng domain riêng:
```bash
# Tạo hosted zone
aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)
```

### 3. HTTPS/SSL
Sử dụng AWS Certificate Manager để enable HTTPS miễn phí.
