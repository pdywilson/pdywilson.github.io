
plugins {
    kotlin("jvm") version "1.9.0"
}

group = "io.pdywilson.kotlinhtml"
version = "0.0.1"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-html:0.11.0")
}