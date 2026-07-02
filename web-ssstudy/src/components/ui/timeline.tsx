import React from 'react';

interface TimelineItem {
  order: number;
  image_url: string;
  year: string;
  description: string;
}

interface TimelineProps {
  steps: TimelineItem[];
  className?: string;
}

export function Timeline({ steps, className = '' }: TimelineProps) {
  const currentYear = new Date().getFullYear();
  return (
    <div className={`timeline-container ${className}`}>
      <div className="timeline-track">
        {steps.map((step, index) => (
          <React.Fragment key={step.order}>
            <div
              className={`timeline-node ${
                Number(step.year) === currentYear ? 'active' : ''
              } ${Number(step.year) < currentYear ? 'completed' : ''}`}
            >
              {step &&
                (index % 2 === 0 ? (
                  <div className="timeline-item-top">
                    <img
                      className="w-[256px] h-[156px] object-cover"
                      src={step.image_url}
                      alt=""
                    />
                    <div className="px-8 py-6 w-[256px] h-[234px] flex flex-col justify-start">
                      <div className="text-[28px]">{step.year}</div>
                      <div className="whitespace-pre-line text-[#50556F] text-base">
                        {step.description}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="timeline-item-bottom">
                    <div className="px-8 py-6 w-[256px] h-[234px] flex flex-col justify-start">
                      <div className="text-[28px]">{step.year}</div>
                      <div className="whitespace-pre-line text-[#50556F] text-base">
                        {step.description}
                      </div>
                    </div>
                    <img
                      className="w-[256px] h-[156px] object-cover"
                      src={step.image_url}
                      alt=""
                    />
                  </div>
                ))}
            </div>
            {index < steps.length && <div className={'timeline-connector'} />}
          </React.Fragment>
        ))}
      </div>

      <style jsx>{`
        .timeline-container {
          width: 100%;
          padding: 20px 0;
        }

        .timeline-track {
          display: flex;
          align-items: center;
          position: relative;
          min-height: 60px;
        }

        .timeline-node {
          position: relative;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #e5e7eb;
          border: 3px solid #9ab4e9;
          box-shadow: 0 0 0 2px #d1d5db;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-description: center;
        }

        .timeline-node.active {
          background-color: #f44336;
          box-shadow: 0 0 0 2px #faa9a3;
          border: 3px solid #faa9a3 !important;
        }

        .timeline-node.completed {
          background-color: #235cd0;
          box-shadow: 0 0 0 2px #9ab4e9;
        }

        .timeline-connector {
          flex: 1;
          height: 2px;
          background: repeating-linear-gradient(
            to right,
            #50556f 0,
            #50556f 4px,
            transparent 4px,
            transparent 8px
          );
          margin: 0 10px;
          min-width: 180px;
        }

        .timeline-connector.completed {
          background: repeating-linear-gradient(
            to right,
            #3b82f6 0,
            #3b82f6 4px,
            transparent 4px,
            transparent 8px
          );
        }

        .timeline-item-top {
          position: relative;
          transform: translateX(2%) translateY(-54%);
          border-left: 1px solid #000000;
        }

        .timeline-item-bottom {
          position: relative;
          transform: translateX(3%) translateY(54%);
          border-left: 1px solid #000;
        }
      `}</style>
    </div>
  );
}

// Example usage component
export function ExampleTimeline() {
  const steps: TimelineItem[] = [
    {
      order: 1,
      image_url: '/imgs/home/timeline-example.png',
      year: '2022',
      description:
        'Anh Nguyễn Tiến Đạt bắt đầu dạy gia sư cho các bạn học sinh lớp 10, 11, 12',
    },
    {
      order: 2,
      image_url: '/imgs/home/timeline-example.png',
      year: '2023',
      description:
        'Anh Nguyễn Tiến Đạt bắt đầu dạy gia sư cho các bạn học sinh lớp 10, 11, 12',
    },
    {
      order: 3,
      image_url: '/imgs/home/timeline-example.png',
      year: '2024',
      description:
        'Anh Nguyễn Tiến Đạt bắt đầu dạy gia sư cho các bạn học sinh lớp 10, 11, 12',
    },
    {
      order: 4,
      image_url: '/imgs/home/timeline-example.png',
      year: '2025',
      description:
        'Anh Nguyễn Tiến Đạt bắt đầu dạy gia sư cho các bạn học sinh lớp 10, 11, 12',
    },
    {
      order: 5,
      image_url: '/imgs/home/timeline-example.png',
      year: '2026',
      description:
        'Anh Nguyễn Tiến Đạt bắt đầu dạy gia sư cho các bạn học sinh lớp 10, 11, 12',
    },
    {
      order: 6,
      image_url: '/imgs/home/timeline-example.png',
      year: '2027',
      description:
        'Anh Nguyễn Tiến Đạt bắt đầu dạy gia sư cho các bạn học sinh lớp 10, 11, 12',
    },
  ];

  return (
    <div className="w-full my-[360px]">
      <Timeline steps={steps} />
    </div>
  );
}
