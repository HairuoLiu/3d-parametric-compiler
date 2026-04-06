diameter = 52;
thickness = 5;
inner_diameter = 45;

difference() {
    cylinder(d=diameter, h=thickness);
    cylinder(d=inner_diameter, h=thickness + 1);
}