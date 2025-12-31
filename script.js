
document.addEventListener('DOMContentLoaded', () => {
  const calculateBtn = document.getElementById('calculateBtn');
  const resultDiv = document.getElementById('result');

  // 上海2025年社保公积金比例
  const insuranceRates = {
    pension: 0.08,        // 养老保险个人
    medical: 0.02,        // 医疗保险个人
    unemployment: 0.005,  // 失业保险个人
    injury: 0,            // 工伤保险个人
    maternity: 0,         // 生育保险个人
  };

  const companyRates = {
    pension: 0.16,        // 养老保险公司
    medical: 0.09,        // 医疗保险公司
    unemployment: 0.005,  // 失业保险公司
    injury: 0.002,        // 工伤保险公司
    maternity: 0.01,      // 生育保险公司
  };

  let annualChart = null;

  calculateBtn.addEventListener('click', () => {
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    const insuranceBase = parseFloat(document.getElementById('insuranceBase').value) || 0;
    const housingFundBase = parseFloat(document.getElementById('housingFundBase').value) || 0;
    const housingFundRate = parseFloat(document.getElementById('housingFundRate').value) || 0.07;
    
    // 计算专项附加扣除
    const deductionCheckboxes = document.querySelectorAll('input[name="deduction"]:checked');
    let additionalDeduction = 0;
    deductionCheckboxes.forEach(checkbox => {
      additionalDeduction += parseFloat(checkbox.value) || 0;
    });
    // 加上其他扣除项
    const otherDeduction = parseFloat(document.getElementById('otherDeduction').value) || 0;
    additionalDeduction += otherDeduction;

    // 计算五险一金个人部分（按基数计算）
    const pension = insuranceBase * insuranceRates.pension;
    const medical = insuranceBase * insuranceRates.medical;
    const unemployment = insuranceBase * insuranceRates.unemployment;
    const housingFund = housingFundBase * housingFundRate;
    const personalTotal = pension + medical + unemployment + housingFund;

    // 计算公司支出五险一金部分
    const companyPension = insuranceBase * companyRates.pension;
    const companyMedical = insuranceBase * companyRates.medical;
    const companyUnemployment = insuranceBase * companyRates.unemployment;
    const companyInjury = insuranceBase * companyRates.injury;
    const companyMaternity = insuranceBase * companyRates.maternity;
    const companyHousingFund = housingFundBase * housingFundRate;
    const companyInsuranceTotal = companyPension + companyMedical + companyUnemployment + companyInjury + companyMaternity + companyHousingFund;

    // 应纳税所得额 = 工资 - 五险一金个人部分 - 起征点(5000) - 专项附加扣除
    const taxableIncome = salary - personalTotal - 5000 - additionalDeduction;
    
    // 计算年度累计个税（用于显示平均月度数据）
    const yearlyTaxableIncome = (salary - personalTotal - 5000 - additionalDeduction) * 12;
    let yearlyTax = 0;
    if (yearlyTaxableIncome > 0) {
      if (yearlyTaxableIncome <= 36000) {
        yearlyTax = yearlyTaxableIncome * 0.03;
      } else if (yearlyTaxableIncome <= 144000) {
        yearlyTax = yearlyTaxableIncome * 0.1 - 2520;
      } else if (yearlyTaxableIncome <= 300000) {
        yearlyTax = yearlyTaxableIncome * 0.2 - 16920;
      } else if (yearlyTaxableIncome <= 420000) {
        yearlyTax = yearlyTaxableIncome * 0.25 - 31920;
      } else if (yearlyTaxableIncome <= 660000) {
        yearlyTax = yearlyTaxableIncome * 0.3 - 52920;
      } else if (yearlyTaxableIncome <= 960000) {
        yearlyTax = yearlyTaxableIncome * 0.35 - 85920;
      } else {
        yearlyTax = yearlyTaxableIncome * 0.45 - 181920;
      }
    }
    
    // 平均月度个税和税后工资
    const avgMonthlyTax = yearlyTax / 12;
    const avgNetSalary = salary - personalTotal - avgMonthlyTax;
    
    // 公司总支出 = 税前工资 + 公司五险一金部分
    const companyCost = salary + companyInsuranceTotal;

    // 生成12个月详细明细表（使用累计预扣预缴算法）
    const monthlyData = generateMonthlyDetails(salary, pension + medical + unemployment, housingFund, additionalDeduction, avgMonthlyTax, avgNetSalary);
    
    // 显示结果（使用范围值）
    document.getElementById('netSalary').textContent = `¥${monthlyData.minNetSalary.toFixed(2)} - ¥${monthlyData.maxNetSalary.toFixed(2)}`;
    document.getElementById('personalPayment').textContent = `¥${(personalTotal + monthlyData.minTax).toFixed(2)} - ¥${(personalTotal + monthlyData.maxTax).toFixed(2)}`;
    document.getElementById('companyCost').textContent = `¥${companyCost.toFixed(2)}`;
    
    // 更新详细构成
    document.getElementById('pension').textContent = `¥${pension.toFixed(2)}`;
    document.getElementById('medical').textContent = `¥${medical.toFixed(2)}`;
    document.getElementById('unemployment').textContent = `¥${unemployment.toFixed(2)}`;
    document.getElementById('housingFund').textContent = `¥${housingFund.toFixed(2)}`;
    document.getElementById('incomeTax').textContent = `¥${monthlyData.minTax.toFixed(2)} - ¥${monthlyData.maxTax.toFixed(2)}`;
    document.getElementById('personalTotal').textContent = `¥${(personalTotal + monthlyData.minTax).toFixed(2)} - ¥${(personalTotal + monthlyData.maxTax).toFixed(2)}`;
    
    document.getElementById('grossSalary').textContent = `¥${salary.toFixed(2)}`;
    document.getElementById('companyPension').textContent = `¥${companyPension.toFixed(2)}`;
    document.getElementById('companyMedical').textContent = `¥${companyMedical.toFixed(2)}`;
    document.getElementById('companyUnemployment').textContent = `¥${companyUnemployment.toFixed(2)}`;
    document.getElementById('companyInjury').textContent = `¥${companyInjury.toFixed(2)}`;
    document.getElementById('companyMaternity').textContent = `¥${companyMaternity.toFixed(2)}`;
    document.getElementById('companyHousingFund').textContent = `¥${companyHousingFund.toFixed(2)}`;
    document.getElementById('companyTotal').textContent = `¥${companyCost.toFixed(2)}`;
    
    document.getElementById('hfRateDisplay').textContent = (housingFundRate * 100).toFixed(0);
    document.getElementById('companyHfRateDisplay').textContent = (housingFundRate * 100).toFixed(0);
    
    resultDiv.classList.remove('hidden');
    
    // 更新年度图表（去掉月收入柱形图）
    updateAnnualChart(salary, avgNetSalary, companyCost);
  });
  
  function generateMonthlyDetails(salary, socialInsurance, housingFund, deduction, monthlyTax, monthlyNetSalary) {
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const tableBody = document.getElementById('monthlyDetailsTable');
    
    // 清空现有内容
    tableBody.innerHTML = '';
    
    let totalTax = 0;
    let totalNetSalary = 0;
    let minTax = Infinity;
    let maxTax = 0;
    let minNetSalary = Infinity;
    let maxNetSalary = 0;
    
    // 计算累计预扣预缴个税
    for (let i = 0; i < 12; i++) {
      const currentMonth = i + 1;
      
      // 累计应纳税所得额 = (工资 - 五险一金) * 月数 - 起征点 * 月数 - 专项扣除 * 月数
      const cumulativeTaxableIncome = (salary - socialInsurance - housingFund) * currentMonth - 5000 * currentMonth - deduction * currentMonth;
      
      // 计算累计应纳税额
      let cumulativeTax = 0;
      if (cumulativeTaxableIncome > 0) {
        if (cumulativeTaxableIncome <= 36000) {
          cumulativeTax = cumulativeTaxableIncome * 0.03;
        } else if (cumulativeTaxableIncome <= 144000) {
          cumulativeTax = cumulativeTaxableIncome * 0.1 - 2520;
        } else if (cumulativeTaxableIncome <= 300000) {
          cumulativeTax = cumulativeTaxableIncome * 0.2 - 16920;
        } else if (cumulativeTaxableIncome <= 420000) {
          cumulativeTax = cumulativeTaxableIncome * 0.25 - 31920;
        } else if (cumulativeTaxableIncome <= 660000) {
          cumulativeTax = cumulativeTaxableIncome * 0.3 - 52920;
        } else if (cumulativeTaxableIncome <= 960000) {
          cumulativeTax = cumulativeTaxableIncome * 0.35 - 85920;
        } else {
          cumulativeTax = cumulativeTaxableIncome * 0.45 - 181920;
        }
      }
      
      // 本月应扣税额 = 累计应纳税额 - 累计已扣税额
      const currentMonthTax = Math.max(0, cumulativeTax - totalTax);
      totalTax += currentMonthTax;
      
      // 本月税后工资
      const currentMonthNetSalary = salary - socialInsurance - housingFund - currentMonthTax;
      totalNetSalary += currentMonthNetSalary;
      
      // 记录最小最大值
      minTax = Math.min(minTax, currentMonthTax);
      maxTax = Math.max(maxTax, currentMonthTax);
      minNetSalary = Math.min(minNetSalary, currentMonthNetSalary);
      maxNetSalary = Math.max(maxNetSalary, currentMonthNetSalary);
      
      const row = document.createElement('tr');
      row.className = 'border-b border-gray-200 hover:bg-gray-50';
      
      row.innerHTML = `
        <td class="py-3 px-4 text-center font-medium">${monthNames[i]}</td>
        <td class="py-3 px-4 text-right">¥${salary.toFixed(2)}</td>
        <td class="py-3 px-4 text-right">¥${socialInsurance.toFixed(2)}</td>
        <td class="py-3 px-4 text-right">¥${housingFund.toFixed(2)}</td>
        <td class="py-3 px-4 text-right">¥${deduction.toFixed(2)}</td>
        <td class="py-3 px-4 text-right">¥${currentMonthTax.toFixed(2)}</td>
        <td class="py-3 px-4 text-right text-green-600 font-medium">¥${currentMonthNetSalary.toFixed(2)}</td>
      `;
      
      tableBody.appendChild(row);
    }
    
    // 更新年度合计
    document.getElementById('yearlyGross').textContent = `¥${(salary * 12).toFixed(2)}`;
    document.getElementById('yearlySocial').textContent = `¥${(socialInsurance * 12).toFixed(2)}`;
    document.getElementById('yearlyHousing').textContent = `¥${(housingFund * 12).toFixed(2)}`;
    document.getElementById('yearlyDeduction').textContent = `¥${(deduction * 12).toFixed(2)}`;
    document.getElementById('yearlyTax').textContent = `¥${totalTax.toFixed(2)}`;
    document.getElementById('yearlyNet').textContent = `¥${totalNetSalary.toFixed(2)}`;
    
    // 返回范围数据
    return {
      minTax: minTax,
      maxTax: maxTax,
      minNetSalary: minNetSalary,
      maxNetSalary: maxNetSalary,
      totalTax: totalTax,
      totalNetSalary: totalNetSalary
    };
  }
  
  function updateAnnualChart(gross, net, company) {
    const ctx = document.getElementById('annualChart').getContext('2d');
    
    if (annualChart) {
      annualChart.destroy();
    }
    
    annualChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['年收入', '公司年支出'],
        datasets: [
          {
            label: '税前',
            data: [gross * 12, company * 12],
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1
          },
          {
            label: '税后',
            data: [net * 12, 0],
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: '收入对比分析'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '¥' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }
});
