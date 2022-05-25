#include "OrientationTracker.h"

//TODO: fill in from hw 4 as necessary

OrientationTracker::OrientationTracker(double imuFilterAlphaIn,  bool simulateImuIn) :

  imu(),
  gyr{0,0,0},
  acc{0,0,0},
  gyrBias{0,0,0},
  gyrVariance{0,0,0},
  accBias{0,0,0},
  accVariance{0,0,0},
  previousTimeImu(0),
  imuFilterAlpha(imuFilterAlphaIn),
  deltaT(0.0),
  simulateImu(simulateImuIn),
  simulateImuCounter(0),
  flatlandRollGyr(0),
  flatlandRollAcc(0),
  flatlandRollComp(0),
  quaternionGyr{1,0,0,0},
  eulerAcc{0,0,0},
  quaternionComp{1,0,0,0}

  {

}

void OrientationTracker::initImu() {
  Wire1.setSCL(ICM_SCL);
  Wire1.setSDA(ICM_SDA);
  Wire1.begin(ICM_ADR);

  // Try to initialize!
  if (!imu.begin_I2C(ICM_ADR, &Wire1)) {
    Serial.println("Failed to find ICM20948 chip");
    while (1) {
      delay(10);
    }
  }
}


/**
 * TODO: see documentation in header file
 */
void OrientationTracker::measureImuBiasVariance() {
//check if imu.read() returns true
  int count = 0;
  double t_gyrX=0.0, t_gyrY=0.0, t_gyrZ =0.0;
  double t_accX=0.0, t_accY=0.0, t_accZ = 0.0;
  double v_gyrX=0.0, v_gyrY=0.0, v_gyrZ =0.0;
  double v_accX=0.0, v_accY=0.0, v_accZ = 0.0;
  while(count < 1000){
    if(updateImuVariables()){
      //then read imu.gyrX, imu.accX, ...
      //gyro
      t_gyrX += gyr[0];
      t_gyrY += gyr[1];
      t_gyrZ += gyr[2];

      //acc
      t_accX += acc[0];
      t_accY += acc[1];
      t_accZ += acc[2];
      count++;
    }
  }
  //compute bias, variance.
  t_gyrX /= count;
  t_gyrY /= count;
  t_gyrZ /= count;

  t_accX /= count;
  t_accY /= count;
  t_accZ /= count;
  
  //calc variance
  count =0;
  while(count < 1000){
    if(updateImuVariables()){
      //then read imu.gyrX, imu.accX, ...
      //gyro
      v_gyrX += sq(gyr[0] - t_gyrX);
      v_gyrY += sq(gyr[1] - t_gyrY);
      v_gyrZ += sq(gyr[2] - t_gyrZ);

      //acc
      v_accX += sq(acc[0] - t_accX);
      v_accY += sq(acc[1] - t_accY);
      v_accZ += sq(acc[2] - t_accZ);
      count++;
    }
  }

  //compute bias, variance.
  gyrBias[0] = t_gyrX;
  gyrBias[1] = t_gyrY;
  gyrBias[2] = t_gyrZ;

  accBias[0] = t_accX;
  accBias[1] = t_accY;
  accBias[2] = t_accZ;


  gyrVariance[0] = v_gyrX / count;
  gyrVariance[1] = v_gyrY / count;
  gyrVariance[2] = v_gyrZ / count;

  accVariance[0] = v_accX / count;
  accVariance[1] = v_accY / count;
  accVariance[2] = v_accZ / count;
}

void OrientationTracker::setImuBias(double bias[3]) {

  for (int i = 0; i < 3; i++) {
    gyrBias[i] = bias[i];
  }

}

void OrientationTracker::resetOrientation() {

  flatlandRollGyr = 0;
  flatlandRollAcc = 0;
  flatlandRollComp = 0;
  quaternionGyr = Quaternion();
  eulerAcc[0] = 0;
  eulerAcc[1] = 0;
  eulerAcc[2] = 0;
  quaternionComp = Quaternion();

}

bool OrientationTracker::processImu() {

  if (simulateImu) {

    //get imu values from simulation
    updateImuVariablesFromSimulation();

  } else {

    //get imu values from actual sensor
    if (!updateImuVariables()) {

      //imu data not available
      return false;

    }

  }

  //run orientation tracking algorithms
  updateOrientation();

  return true;

}

void OrientationTracker::updateImuVariablesFromSimulation() {

    deltaT = 0.002;
    //get simulated imu values from external file
    for (int i = 0; i < 3; i++) {
      gyr[i] = imuData[simulateImuCounter + i];
    }
    simulateImuCounter += 3;
    for (int i = 0; i < 3; i++) {
      acc[i] = imuData[simulateImuCounter + i];
    }
    simulateImuCounter += 3;
    simulateImuCounter = simulateImuCounter % nImuSamples;

    //simulate delay
    delay(1);

}

/**
 * TODO: see documentation in header file
 */
bool OrientationTracker::updateImuVariables() {

  //sample imu values
  sensors_event_t accel;
  sensors_event_t gyro;
  sensors_event_t mag;
  sensors_event_t temp;
  imu.getEvent(&accel, &gyro, &temp, &mag);

  //call micros() to get current time in microseconds
  //long currentMicroSecond = micros();
  double currentSecond = micros()/1000000;
  //update:
  //previousTimeImu (in seconds)
  //deltaT (in seconds)
  deltaT = currentSecond - previousTimeImu;
  previousTimeImu = currentSecond;
  //Serial.printf("current: %s \t chage: %s",currentSecond,deltaT);
  

  //read imu.gyrX, imu.accX ...
  //update:
  //gyr[0], ...
  //acc[0], ...

  // You also need to appropriately modify the update of gyr as instructed in (2.1.3).
  gyr[0] = gyro.gyro.x - gyrBias[0];
  gyr[1] = gyro.gyro.y - gyrBias[1];
  gyr[2] = gyro.gyro.z - gyrBias[2];

  acc[0] = accel.acceleration.x - accBias[0];
  acc[1] = accel.acceleration.y - accBias[1];
  acc[2] = accel.acceleration.z - accBias[2];

  return true;

}


/**
 * TODO: see documentation in header file
 */
void OrientationTracker::updateOrientation() {

  //call functions in OrientationMath.cpp.
  //use only class variables as arguments to functions.

  //update:
  //flatlandRollGyr
  //flatlandRollAcc
  //flatlandRollComp
  //quaternionGyr
  //eulerAcc
  //quaternionComp




}
