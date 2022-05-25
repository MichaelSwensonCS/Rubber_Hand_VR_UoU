#include "OrientationMath.h"

//TODO: fill in from hw 4 as necessary

/** TODO: see documentation in header file */
double computeAccPitch(double acc[3]) {

 return atan(acc[2]/acc[1])*RAD_TO_DEG*-1;

}

/** TODO: see documentation in header file */
double computeAccRoll(double acc[3]) {

  return atan(acc[0]/acc[1])*RAD_TO_DEG;

}

/** TODO: see documentation in header file */
double computeFlatlandRollGyr(double flatlandRollGyrPrev, double gyr[3], double deltaT) {

  double currentEstimate = gyr[2] * deltaT;

  return flatlandRollGyrPrev + currentEstimate;

}

/** TODO: see documentation in header file */
double computeFlatlandRollAcc(double acc[3]) {

  
  return atan2(acc[0], acc[1])* RAD_TO_DEG;

}

/** TODO: see documentation in header file */
double computeFlatlandRollComp(double flatlandRollCompPrev, double gyr[3], double flatlandRollAcc, double deltaT, double alpha) {

  double currentGyro =alpha * (flatlandRollCompPrev + (gyr[2] * deltaT));
  double currentAcc = (1-alpha)*(flatlandRollAcc);
  return currentGyro + currentAcc;

}


/** TODO: see documentation in header file */
void updateQuaternionGyr(Quaternion& q, double gyr[3], double deltaT) {
  // q is the previous quaternion estimate
  // update it to be the new quaternion estimate
  double length = sqrt(sq(gyr[0])+sq(gyr[1])+sq(gyr[2]));
  double magX = gyr[0];
  double magY = gyr[1];
  double magZ = gyr[2];
  if(length > 0.000001){
    magX /= length;
    magY /= length;
    magZ /= length;
  }
  


  //body
  double angle = deltaT*length;//*RAD_TO_DEG;
  //creating qw(t+dt)
  Quaternion w = Quaternion().setFromAngleAxis(angle, magX,magY,magZ);
  q = Quaternion().multiply(q,w);
  //rotate based on body
  //q.normalize();
  //q.rotate(u);
  //q.normalize();
}


/** TODO: see documentation in header file */
void updateQuaternionComp(Quaternion& q, double gyr[3], double acc[3], double deltaT, double alpha) {
  // q is the previous quaternion estimate
  // update it to be the new quaternion estimate

  double gyrN = sqrt( gyr[0]*gyr[0] + gyr[1]*gyr[1] + gyr[2]*gyr[2] );
  Quaternion qDelta;
  if (gyrN >= 1e-8) {
    qDelta = Quaternion().setFromAngleAxis(
      deltaT * gyrN, gyr[0] / gyrN, gyr[1] / gyrN, gyr[2]/gyrN);
  }
  
  Quaternion qw = Quaternion().multiply(q,qDelta).normalize();
  Quaternion qa = Quaternion(0,acc[0],acc[1],acc[2]);
  qa = qa.rotate(qw);

  double accN = sqrt( qa.q[1]*qa.q[1] + qa.q[2]*qa.q[2] + qa.q[3]*qa.q[3] );
  double phi = RAD_TO_DEG * acos(qa.q[2]/accN);

  double normN = sqrt( qa.q[1]*qa.q[1] + qa.q[3]*qa.q[3] );
  Quaternion qt;
  if (normN >= 1e-8) { 
    qt = Quaternion().setFromAngleAxis( (1-alpha)*phi, -qa.q[3]/normN, 0.0, qa.q[1]/normN).normalize();
  }

  // update
  q = Quaternion().multiply(qt, qw).normalize();
}
