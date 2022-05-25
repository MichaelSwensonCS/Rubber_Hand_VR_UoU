/**
 * Quaternion class
 *
 * We are using C++! Not JavaScript!
 * Unlike JavaScript, "this" keyword is representing a pointer!
 * If you want to access the member variable q[0], you should write
 * this->q[0].
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

#ifndef QUATERNION_H
#define QUATERNION_H

#include "Arduino.h"

class Quaternion {
public:

  /***
   * public member variables to hold the values
   *
   * Definition:
   * q = q[0] + q[1] * i + q[2] * j + q[3] * k
   */
  double q[4];


  /* Default constructor */
  Quaternion() :
    q{1.0, 0.0, 0.0, 0.0} {}


  /* Constructor with some inputs */
  Quaternion(double q0, double q1, double q2, double q3) :
    q{q0, q1, q2, q3} {}


  /* function to create another quaternion with the same values. */
  Quaternion clone() {

    return Quaternion(this->q[0], this->q[1], this->q[2], this->q[3]);

  }

  /* function to construct a quaternion from angle-axis representation. angle is given in degrees. */
  Quaternion& setFromAngleAxis(double angle, double vx, double vy, double vz) {

    double Hangle = angle * 0.5 * DEG_TO_RAD;

    this->q[0] = cos(Hangle);
    this->q[1] = vx * sin(Hangle);
    this->q[2] = vy * sin(Hangle);
    this->q[3] = vz * sin(Hangle);
    return *this;

  }

  /* function to compute the length of a quaternion */
  double length() {

    return sqrt(sq(this->q[0])+sq(this->q[1])+sq(this->q[2])+sq(this->q[3]));

  }

  /* function to normalize a quaternion */
  Quaternion& normalize() {

    double m = this->length();

    this->q[0] = this->q[0] / m;
    this->q[1] = this->q[1] / m;
    this->q[2] = this->q[2] / m;
    this->q[3] = this->q[3] / m;

    return *this;
  }

  /* function to invert a quaternion */
  Quaternion& inverse() {

    double lamda = 1/(sq(this->q[0])+sq(this->q[1])+sq(this->q[2])+sq(this->q[3]));
 
    //q^-1 = Conjugate (a,-b,-c,-d) * 1/lamda

    this->q[0] = this->q[0] * lamda;
    this->q[1] = -this->q[1] * lamda;
    this->q[2] = -this->q[2] * lamda;
    this->q[3] = -this->q[3] * lamda;


    return *this;
  }

  /* function to multiply two quaternions */
  Quaternion multiply(Quaternion a, Quaternion b) {

    Quaternion q;
    double a1 = a.q[0];
    double a2 = b.q[0];

    double b1 = a.q[1];
    double b2 = b.q[1];

    double c1 = a.q[2];
    double c2 = b.q[2];

    double d1 = a.q[3];
    double d2 = b.q[3];
    

    q.q[0] = a1*a2 - b1*b2 - c1*c2 - d1*d2;
    q.q[1] = a1*b2 + a2*b1 + c1*d2 - c2*d1;
    q.q[2] = a1*c2 + a2*c1 + b2*d1 - b1*d2;
    q.q[3] = a1*d2 + a2*d1 + b1*c2 - b2*c1;
    return q;
  }

  /* function to rotate a quaternion by r * q * r^{-1} */
  Quaternion rotate(Quaternion r) {
    r.normalize();
    this->normalize();
    
    Quaternion rPrime = r.clone().inverse();
    Quaternion part1 = Quaternion().multiply(r,this->clone());
    Quaternion part2 = Quaternion().multiply(part1,rPrime);

    return part2;

  }


  /* helper function to print out a quaternion */
  void serialPrint() {
    Serial.print(q[0]);
    Serial.print(" ");
    Serial.print(q[1]);
    Serial.print(" ");
    Serial.print(q[2]);
    Serial.print(" ");
    Serial.print(q[3]);
    Serial.println();
  }
};

#endif // ifndef QUATERNION_H
