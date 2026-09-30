pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Check') {
            steps {
                sh 'docker --version'
                sh 'docker compose version'
            }
        }

        stage('Build Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Start Application') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Test Backend API') {
            steps {
                sh '''
                    echo "Waiting for backend API..."

                    for i in {1..30}; do
                        if curl -f http://localhost:5001/api/v1/restaurants; then
                            echo "Backend API is working!"
                            exit 0
                        fi

                        echo "Backend not ready yet... waiting 2 seconds"
                        sleep 2
                    done

                    echo "Backend failed to become ready"
                    exit 1
                '''
            }
        }
    }
}                    
