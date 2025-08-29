"use client";

import { useLayoutEffect } from 'react';
import * as THREE from 'three';
import type { Object3D } from 'three';

type Props = {
  scene: Object3D;
  animationData: any; // Dữ liệu từ file JSON
  step: number;
};

// Component này sẽ áp dụng các transform từ JSON lên model
export default function AnimatedModel({ scene, animationData, step }: Props) {
  useLayoutEffect(() => {
    // Kiểm tra xem dữ liệu đã sẵn sàng chưa
    if (!scene || !animationData) return;

    // Giả sử chúng ta chỉ làm việc với phase đầu tiên
    // và step tương ứng với subStep index
    const stepData = animationData[0]?.subSteps[step];

    if (!stepData) {
      console.warn(`Không tìm thấy dữ liệu cho step ${step}`);
      return;
    }

    const { transforms, visibility } = stepData;

    // Duyệt qua tất cả các đối tượng trong model
    scene.traverse((child) => {
      // Áp dụng transform nếu có định nghĩa trong JSON
      if (transforms && transforms[child.name]) {
        const transform = transforms[child.name];
        
        // Cập nhật vị trí, xoay, và tỷ lệ
        if (transform.position) {
            child.position.set(transform.position.x, transform.position.y, transform.position.z);
        }
        if (transform.quaternion) {
            child.quaternion.set(transform.quaternion._x, transform.quaternion._y, transform.quaternion._z, transform.quaternion._w);
        }
        if (transform.scale) {
            child.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
        }
      }

      // Áp dụng visibility nếu có định nghĩa
      if (visibility && child instanceof THREE.Mesh) {
        child.visible = visibility[child.name] ?? true;
      }
    });

  }, [scene, animationData, step]); // Chạy lại effect khi step thay đổi

  // Trả về model đã được cập nhật
  return <primitive object={scene} />;
}