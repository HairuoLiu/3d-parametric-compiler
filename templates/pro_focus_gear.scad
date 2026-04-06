/**
 * @file Pro_Focus_Gear_V2.scad
 * @brief 混合动力对焦齿轮环 (支持 TPU 一体式与 螺栓分体式)
 * @author Gemini CAD Expert
 */

/* [设计模式选择] */
// 选择模型类型: CLAMP (分体锁紧式) 或 SEAMLESS (TPU 一体式)
design_mode = "SEAMLESS"; // [CLAMP, SEAMLESS]

/* [基础尺寸参数] */
// 镜头实际物理外径 (mm)
lens_id = 82.0; 
// 齿轮模数 (Cinema Standard = 0.8)
gear_module = 0.8; 
// 齿轮宽度/厚度 (mm)
gear_thickness = 10.0; 
// 缓冲层厚度 (从内壁到齿根的距离) (mm)
buffer_distance = 3.0; 

/* [TPU 一体式专用参数] */
// TPU 抓紧力补偿 (减小内径以便拉伸紧固，建议 0.5-1.0)
stretch_offset = 0.8; 

/* [分体锁紧式专用参数] */
// 螺栓直径 (M3=3.2)
bolt_diameter = 3.2;
// 锁紧缝隙宽度 (mm)
gap_width = 2.0;

/* [高级齿轮参数] */
pressure_angle = 20;
$fn = 120;

// --- 自动计算逻辑 ---
// 根据模式调整内径
actual_id = (design_mode == "SEAMLESS") ? (lens_id - stretch_offset) : lens_id;

// 计算齿轮几何
ideal_pd = actual_id + (2 * buffer_distance) + (2 * gear_module);
num_teeth = round(ideal_pd / gear_module);
pd = num_teeth * gear_module;
od = pd + (2 * gear_module);

echo(str("Mode Selected: ", design_mode));
echo(str("Total Teeth: ", num_teeth));
echo(str("Calculated OD: ", od));

// --- 渲染主程序 ---
main();

module main() {
    difference() {
        union() {
            // 1. 核心齿轮体
            generate_involute_gear(num_teeth, gear_module, pressure_angle, gear_thickness);
            
            // 2. 缓冲层基座
            cylinder(d = pd - gear_module, h = gear_thickness, center = true);
            
            // 3. 如果是锁紧模式，增加法兰凸台
            if (design_mode == "CLAMP") {
                flange_support();
            }
        }
        
        // 4. 减去镜头中心孔
        cylinder(d = actual_id, h = gear_thickness + 2, center = true);
        
        // 5. 如果是锁紧模式，减去缝隙和螺丝孔
        if (design_mode == "CLAMP") {
            clamping_cutout();
        }
    }
}

/**
 * 工业级渐开线齿形生成器
 */
module generate_involute_gear(n, m, pa, h) {
    pr = (n * m) / 2;
    intersection() {
        cylinder(d = od, h = h, center = true);
        union() {
            for (i = [0 : n-1]) {
                rotate([0, 0, i * (360/n)])
                translate([pr, 0, 0])
                linear_extrude(height = h, center = true)
                // 精确齿形多边形逼近
                polygon(points=[
                    [-(m*1.5), -(PI*m)/2.5],
                    [m, -(PI*m)/8],
                    [m, (PI*m)/8],
                    [-(m*1.5), (PI*m)/2.5]
                ]);
            }
            // 齿根加强圆柱
            cylinder(r = pr - 1.25*m, h = h, center = true);
        }
    }
}

/**
 * 分体式法兰加强筋
 */
module flange_support() {
    translate([actual_id/2 + buffer_distance/2, 0, 0])
    cube([12, 18, gear_thickness], center = true);
}

/**
 * 螺栓孔与切割缝隙
 */
module clamping_cutout() {
    // 切割缝
    translate([actual_id/2 + 5, 0, 0])
    cube([25, gap_width, gear_thickness + 1], center = true);
    
    // 螺栓孔
    translate([actual_id/2 + 6, 0, 0])
    rotate([90, 0, 0]) {
        cylinder(d = bolt_diameter, h = 30, center = true);
        // 螺帽六角槽 (预留沉头)
        translate([0, 0, 4.5])
        cylinder(d = 6.2, h = 10, $fn = 6);
    }
}