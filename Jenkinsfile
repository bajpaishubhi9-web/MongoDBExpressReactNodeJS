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

        stage('Check Containers') {
            steps {
                sh 'docker compose ps'
            }
        }

        stage('Test Backend API') {
            steps {
                sh '''
                    echo "Waiting for backend API..."

                    for i in $(seq 1 30); do

                        echo "Attempt $i of 30"

                        if curl -sSf http://127.0.0.1:5001/api/v1/restaurants; then
                            echo ""
                            echo "Backend API is working!"
                            exit 0
                        fi

                        echo "Backend not ready yet..."
                        sleep 2
                    done

                    echo "Backend failed to become ready"
                    echo "Backend logs:"
                    docker compose logs backend --tail=50

                    exit 1
                '''
            }
        }
    }

    post {
        always {
            sh 'docker compose ps'
        }
    }
}                   
