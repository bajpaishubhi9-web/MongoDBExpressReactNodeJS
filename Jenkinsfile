pipeline {

    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DOCKERHUB_USERNAME = 'shubhibajpai'

        GITOPS_REPO = 'https://github.com/bajpaishubhi9-web/restaurant-k8s.git'
        GITOPS_CREDENTIALS = 'github-gitops-creds'

        BACKEND_IMAGE = 'shubhibajpai/restaurant-backend'
        FRONTEND_IMAGE = 'shubhibajpai/restaurant-frontend'
        MONGO_IMAGE = 'shubhibajpai/restaurant-mongodb'

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Application') {
            steps {
                echo 'Checking out application repository...'
                checkout scm
            }
        }

        stage('Docker Check') {
            steps {
                sh 'docker --version'
                sh 'docker info'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "Building Docker images with tag ${IMAGE_TAG}..."

                sh """
                    docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        ./backend

                    docker build \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        ./frontend

                    docker build \
                        -t ${MONGO_IMAGE}:${IMAGE_TAG} \
                        -f mongo-init/Dockerfile .
                """
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                echo 'Pushing Docker images to Docker Hub...'

                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | \
                    docker login \
                    --username "$DOCKERHUB_USERNAME" \
                    --password-stdin

                    docker push "$BACKEND_IMAGE:$IMAGE_TAG"
                    docker push "$FRONTEND_IMAGE:$IMAGE_TAG"
                    docker push "$MONGO_IMAGE:$IMAGE_TAG"

                    docker logout
                '''
            }
        }

        stage('Update GitOps Repository') {
        steps {
    
            echo "Updating GitOps repository to image tag ${IMAGE_TAG}..."
    
            dir('restaurant-k8s') {
    
                git(
                    branch: 'main',
                    credentialsId: "${GITOPS_CREDENTIALS}",
                    url: "${GITOPS_REPO}"
                )
    
                withCredentials([
                    usernamePassword(
                        credentialsId: "${GITOPS_CREDENTIALS}",
                        usernameVariable: 'GIT_USERNAME',
                        passwordVariable: 'GIT_PASSWORD'
                    )
                ]) {
    
                    sh '''
                        set -e
    
                        echo "Updating backend image..."
                        sed -i "s|image: ${BACKEND_IMAGE}:.*|image: ${BACKEND_IMAGE}:${IMAGE_TAG}|" backend/deployment.yaml
    
                        echo "Updating frontend image..."
                        sed -i "s|image: ${FRONTEND_IMAGE}:.*|image: ${FRONTEND_IMAGE}:${IMAGE_TAG}|" frontend/deployment.yaml
    
                        echo "Updating MongoDB image..."
                        sed -i "s|image: ${MONGO_IMAGE}:.*|image: ${MONGO_IMAGE}:${IMAGE_TAG}|" mongodb/deployment.yaml
    
                        echo "GitOps files after update:"
                        grep "image:" backend/deployment.yaml
                        grep "image:" frontend/deployment.yaml
                        grep "image:" mongodb/deployment.yaml
    
                        git config user.name "Jenkins"
                        git config user.email "jenkins@localhost"
    
                        git add \
                            backend/deployment.yaml \
                            frontend/deployment.yaml \
                            mongodb/deployment.yaml
    
                        if git diff --cached --quiet; then
                            echo "No GitOps changes detected."
                        else
                            git commit -m "Update application images to build ${BUILD_NUMBER}"
    
                            git remote set-url origin "https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/bajpaishubhi9-web/restaurant-k8s.git"
    
                            git push origin main
                        fi
                    '''
                }
            }
        }
    }

        stage('GitOps Deployment Triggered') {
            steps {
                echo 'GitOps repository updated.'
                echo 'Argo CD will detect the Git change and synchronize Kubernetes.'
            }
        }
    }

    post {

        success {
            echo '=============================================='
            echo 'CI/CD PIPELINE COMPLETED SUCCESSFULLY'
            echo '=============================================='
            echo "Build Number: ${BUILD_NUMBER}"
            echo "Image Tag: ${IMAGE_TAG}"
            echo "Backend:  ${BACKEND_IMAGE}:${IMAGE_TAG}"
            echo "Frontend: ${FRONTEND_IMAGE}:${IMAGE_TAG}"
            echo "MongoDB:  ${MONGO_IMAGE}:${IMAGE_TAG}"
            echo 'Docker images pushed to Docker Hub.'
            echo 'GitOps repository updated.'
            echo 'Argo CD will deploy to Kubernetes.'
        }

        failure {
            echo '=============================================='
            echo 'CI/CD PIPELINE FAILED'
            echo '=============================================='
            echo 'Check the failed stage in Console Output.'
        }
    }
}
